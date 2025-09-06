#!/usr/bin/env node

import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { glob } from 'glob';
import OpenAI from 'openai';
import equal from 'fast-deep-equal';
import { bold, green, yellow, red, cyan, gray } from 'kleur/colors';

// ========= Config =========
const ROOT = process.cwd();
const SRC_LOCALE = process.env.SOURCE_LOCALE || 'en';
const TARGET_LOCALES = (process.env.TARGET_LOCALES || 'ko,ja,id,vi')
  .split(',').map((s) => s.trim()).filter(Boolean);
const MODEL = process.env.MODEL || 'gpt-4o-mini';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const MAX_INPUT_BYTES = 500 * 1000; // 500KB 안전선
const RETRIES = 3;
const TEMPERATURE = 0.1;

// ========= Language Names =========
const LANGUAGE_NAMES = {
  ko: 'Korean (한국어)',
  ja: 'Japanese (日本語)',
  id: 'Indonesian (Bahasa Indonesia)',
  vi: 'Vietnamese (Tiếng Việt)',
  en: 'English'
};

// ========= Helpers =========
const readJSON = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
const writeJSON = (p, obj) => {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, JSON.stringify(obj, null, 2) + '\\n', 'utf8');
};

const stableStringify = (obj) => JSON.stringify(sortKeysDeep(obj));

function sortKeysDeep(obj) {
  if (Array.isArray(obj)) return obj.map(sortKeysDeep);
  if (obj && typeof obj === 'object') {
    return Object.keys(obj).sort().reduce((acc, k) => {
      acc[k] = sortKeysDeep(obj[k]);
      return acc;
    }, {});
  }
  return obj;
}

function bytesLength(str) {
  return Buffer.byteLength(str, 'utf8');
}

function chunkObject(obj, maxBytes) {
  const entries = Object.entries(obj);
  const chunks = [];
  let cur = {};
  
  for (const [k, v] of entries) {
    const test = stableStringify({ ...cur, [k]: v });
    const b = bytesLength(test);
    
    if (b > maxBytes && Object.keys(cur).length === 0) {
      // Single large value -> force put alone
      chunks.push({ [k]: v });
      continue;
    }
    
    if (b > maxBytes) {
      chunks.push(cur);
      cur = { [k]: v };
    } else {
      cur[k] = v;
    }
  }
  
  if (Object.keys(cur).length) chunks.push(cur);
  return chunks;
}

function sanitizeJSON(text) {
  // Try to extract JSON block if the model added extra text
  const match = text.match(/```json\\s*([\\s\\S]*?)\\s*```/i) || text.match(/```\\s*([\\s\\S]*?)\\s*```/);
  const body = match ? match[1] : text;
  return JSON.parse(body);
}

// ========= OpenAI client =========
if (!OPENAI_API_KEY) {
  console.error(red('Error: OPENAI_API_KEY is missing. Please set it in your environment.'));
  console.error(yellow('You can set it in .env file or as environment variable.'));
  process.exit(1);
}

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

// ========= Prompt =========
function buildPrompt(targetLang, jsonChunk, filename) {
  const langName = LANGUAGE_NAMES[targetLang] || targetLang;
  
  return `You are a professional translator for a fintech/crypto SaaS platform called CoinToss.

CONTEXT: CoinToss is a crypto referral platform that helps partners earn commissions through exchange referrals and AI automation.

TASK: Translate the following JSON values from English to ${langName}.

RULES:
1. Keep JSON structure and keys identical
2. Preserve ALL placeholders like {user}, {amount}, {percentage}, {count}, {tier} - DO NOT translate them
3. Keep UI labels concise (1-3 words for buttons/navigation)
4. Use professional, trustworthy tone appropriate for financial services
5. For technical terms, use commonly accepted translations in the crypto/fintech industry
6. If uncertain about translation, return "__MISSING__" for that value
7. Output ONLY valid JSON (no commentary, no markdown)

FILE CONTEXT: This is from "${filename}" - consider the context when translating.

JSON to translate:
${JSON.stringify(jsonChunk, null, 2)}`;
}

// ========= Core translation =========
async function translateChunk(chunk, targetLang, filename) {
  const content = buildPrompt(targetLang, chunk, filename);
  let lastErr;
  
  for (let i = 0; i < RETRIES; i++) {
    try {
      const resp = await openai.chat.completions.create({
        model: MODEL,
        temperature: TEMPERATURE,
        messages: [
          { 
            role: 'system', 
            content: 'You are a professional translator. Output only valid JSON. Never include comments or markdown.' 
          },
          { role: 'user', content }
        ]
      });
      
      const output = resp.choices?.[0]?.message?.content?.trim();
      if (!output) throw new Error('Empty response from OpenAI');
      
      const json = sanitizeJSON(output);
      
      // Validate that we got back the same keys
      const originalKeys = Object.keys(chunk);
      const translatedKeys = Object.keys(json);
      
      if (originalKeys.length !== translatedKeys.length) {
        throw new Error(`Key count mismatch: expected ${originalKeys.length}, got ${translatedKeys.length}`);
      }
      
      return json;
    } catch (e) {
      lastErr = e;
      console.log(yellow(`  Retry ${i + 1}/${RETRIES} for ${targetLang}: ${e.message}`));
      
      if (i < RETRIES - 1) {
        await new Promise(r => setTimeout(r, 1000 * (i + 1)));
      }
    }
  }
  
  throw lastErr;
}

async function translateFile(enPath, targetLang) {
  const src = readJSON(enPath);
  const srcSorted = sortKeysDeep(src);
  const filename = path.basename(enPath);
  const targetPath = enPath.replace(`${path.sep}${SRC_LOCALE}${path.sep}`, `${path.sep}${targetLang}${path.sep}`);

  // Split if too large
  const serialized = stableStringify(srcSorted);
  const chunks = bytesLength(serialized) > MAX_INPUT_BYTES
    ? chunkObject(srcSorted, MAX_INPUT_BYTES)
    : [srcSorted];

  console.log(`  Translating to ${LANGUAGE_NAMES[targetLang]} (${chunks.length} chunk${chunks.length > 1 ? 's' : ''})`);

  const translatedPieces = [];
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    if (chunks.length > 1) {
      console.log(`    Processing chunk ${i + 1}/${chunks.length}`);
    }
    
    const part = await translateChunk(chunk, targetLang, filename);
    translatedPieces.push(part);
  }

  // Merge chunks
  const merged = translatedPieces.reduce((acc, cur) => ({ ...acc, ...cur }), {});
  const tgtSorted = sortKeysDeep(merged);

  // Check if file needs updating
  const tgtExisting = fs.existsSync(targetPath) ? readJSON(targetPath) : {};
  
  if (!equal(tgtSorted, sortKeysDeep(tgtExisting))) {
    writeJSON(targetPath, tgtSorted);
    console.log(green(`    ✔ Updated ${targetLang}/${filename}`));
  } else {
    console.log(gray(`    = No changes for ${targetLang}/${filename}`));
  }
}

async function main() {
  const args = process.argv.slice(2);
  const checkOnly = args.includes('--check');
  const fileArgIdx = args.indexOf('--file');
  const langsArgIdx = args.indexOf('--langs');

  const files = fileArgIdx > -1
    ? [path.resolve(ROOT, args[fileArgIdx + 1])]
    : await glob(`messages/${SRC_LOCALE}/**/*.json`, { cwd: ROOT });

  const targets = langsArgIdx > -1
    ? args[langsArgIdx + 1].split(',').map(s => s.trim())
    : TARGET_LOCALES;

  if (files.length === 0) {
    console.error(red(`No translation files found in messages/${SRC_LOCALE}/`));
    console.log(yellow('Create some JSON files in that directory first.'));
    process.exit(1);
  }

  console.log(bold(cyan(`\\n🌐 CoinToss i18n Auto-Translator`)));
  console.log(`Source: ${bold(SRC_LOCALE.toUpperCase())} → Targets: ${bold(targets.map(t => t.toUpperCase()).join(', '))}\\n`);

  for (const f of files) {
    const relativePath = path.relative(ROOT, f);
    console.log(bold(`📄 ${relativePath}`));
    
    if (checkOnly) {
      for (const lang of targets) {
        const targetPath = f.replace(`${path.sep}${SRC_LOCALE}${path.sep}`, `${path.sep}${lang}${path.sep}`);
        if (!fs.existsSync(targetPath)) {
          console.log(yellow(`  ⚠ Missing ${lang}/${path.basename(f)}`));
        } else {
          console.log(green(`  ✓ ${lang}/${path.basename(f)} exists`));
        }
      }
      continue;
    }

    const src = readJSON(f);
    const serialized = stableStringify(src);
    
    if (bytesLength(serialized) > MAX_INPUT_BYTES * 4) {
      console.log(red('  ❌ File too large even for chunking. Consider splitting the JSON.'));
      continue;
    }

    for (const lang of targets) {
      try {
        await translateFile(path.resolve(ROOT, f), lang);
      } catch (e) {
        console.error(red(`  ❌ Failed ${lang}/${path.basename(f)}: ${e.message}`));
      }
    }
    
    console.log(); // Empty line between files
  }

  if (checkOnly) {
    console.log(bold(cyan('\\n✅ Translation status check complete.\\n')));
  } else {
    console.log(bold(green('\\n🎉 Translation process complete!\\n')));
    console.log('💡 Tips:');
    console.log('  • Run "npm run translate:check" to verify all translations exist');
    console.log('  • Edit only English files, then re-run this script');
    console.log('  • Look for "__MISSING__" values in translated files\\n');
  }
}

main().catch((e) => {
  console.error(red('\\n❌ Translation failed:'), e.message);
  if (e.stack) console.error(gray(e.stack));
  process.exit(1);
});