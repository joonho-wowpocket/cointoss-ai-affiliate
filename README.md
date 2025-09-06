# CoinToss MVP

A crypto referral platform with AI-powered partner assistance and multi-language support.

## Features

- 🌐 **Multi-language Support**: 5 languages (Korean, Japanese, Indonesian, Vietnamese, English)
- 🤖 **AI Translation**: Automated translation using ChatGPT API  
- 📱 **Responsive Design**: Mobile-first approach with collapsible sidebar
- 🎨 **Theme Support**: Light/Dark/System themes
- 🔐 **Supabase Integration**: Backend API and authentication ready
- ⚡ **Modern Stack**: React, TypeScript, Tailwind CSS, Vite

## Translation System

### Quick Start

1. Set up your OpenAI API key in Supabase secrets (already configured)

2. Edit English translation files in `messages/en/`:
   - `nav.json` - Navigation labels
   - `common.json` - Common UI elements  
   - `dashboard.json` - Dashboard content

3. Run the translation script:
   ```bash
   npm run translate
   ```

### Available Commands

```bash
# Translate all files to all languages
npm run translate

# Check which translations are missing
npm run translate:check

# Translate specific file to specific languages  
npm run translate:file messages/en/nav.json --langs ko,ja
```

### Translation Rules

1. **English Only**: Only edit files in `messages/en/` - all other languages are auto-generated
2. **Placeholders**: Keep `{user}`, `{amount}`, `{count}` etc. unchanged
3. **UI Labels**: Keep navigation and button labels short (1-3 words)
4. **Professional Tone**: Maintain trustworthy, financial services appropriate language
5. **Missing Translations**: Look for `__MISSING__` in generated files and manually fix if needed

### File Structure

```
messages/
├── en/          # ✅ Edit these files
│   ├── nav.json
│   ├── common.json
│   └── dashboard.json
├── ko/          # 🤖 Auto-generated
├── ja/          # 🤖 Auto-generated
├── id/          # 🤖 Auto-generated
└── vi/          # 🤖 Auto-generated
```

### Adding New Content

1. Add new keys to appropriate English JSON files
2. Run `npm run translate` to generate translations
3. Review generated translations for accuracy
4. Manually fix any `__MISSING__` values

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
src/
├── components/          # UI components
│   ├── ui/             # shadcn/ui components
│   ├── Header.tsx      # App header with theme/language switchers
│   ├── ResponsiveSidebar.tsx  # Collapsible sidebar
│   └── ...
├── contexts/           # React contexts
│   └── I18nContext.tsx # Internationalization
├── lib/               # Utilities
│   ├── i18n.ts        # Translation constants
│   └── i18n-file-based.ts  # File-based translation loader
├── pages/             # Application pages
└── ...
```

## Deployment

The application is configured to work with:
- **Supabase**: Backend services and authentication
- **Vercel/Netlify**: Frontend hosting  
- **GitHub Actions**: CI/CD (optional)

OpenAI API key is securely stored in Supabase secrets for the translation system.

## Contributing

1. Edit only English translation files
2. Run `npm run translate` before committing
3. Test in multiple languages using the language switcher
4. Ensure responsive design works on mobile/desktop

---

Built with ❤️ by the CoinToss team