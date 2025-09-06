import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Languages, Download, Upload, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface TranslationResult {
  [language: string]: any;
}

export function TranslationManager() {
  const [sourceMessages, setSourceMessages] = useState('');
  const [translations, setTranslations] = useState<TranslationResult>({});
  const [isTranslating, setIsTranslating] = useState(false);
  const { toast } = useToast();

  const targetLanguages = ['ko', 'ja', 'id', 'vi'];
  const languageNames = {
    ko: '한국어',
    ja: '日本語', 
    id: 'Indonesia',
    vi: 'Tiếng Việt'
  };

  const handleTranslate = async () => {
    if (!sourceMessages.trim()) {
      toast({
        title: "Input Required",
        description: "Please enter JSON messages to translate",
        variant: "destructive",
      });
      return;
    }

    let parsedMessages;
    try {
      parsedMessages = JSON.parse(sourceMessages);
    } catch (error) {
      toast({
        title: "Invalid JSON",
        description: "Please check your JSON format",
        variant: "destructive",
      });
      return;
    }

    setIsTranslating(true);
    try {
      const { data, error } = await supabase.functions.invoke('translate-i18n', {
        body: {
          sourceFile: 'manual-input',
          targetLanguages,
          messages: parsedMessages
        }
      });

      if (error) throw error;

      if (data?.success) {
        setTranslations(data.data.translations);
        toast({
          title: "Translation Complete",
          description: `Successfully translated to ${targetLanguages.length} languages`,
        });
      } else {
        throw new Error(data?.error || 'Translation failed');
      }
    } catch (error) {
      console.error('Translation error:', error);
      toast({
        title: "Translation Failed",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsTranslating(false);
    }
  };

  const downloadTranslations = () => {
    Object.entries(translations).forEach(([lang, content]) => {
      const blob = new Blob([JSON.stringify(content, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${lang}.json`;
      a.click();
      URL.revokeObjectURL(url);
    });

    toast({
      title: "Download Complete",
      description: "All translation files have been downloaded",
    });
  };

  const loadSampleData = () => {
    const sample = {
      "dashboard": "Dashboard",
      "partnerHub": "Partner Hub", 
      "exchanges": "Exchanges",
      "earnings": "Your earnings: {amount} USDT",
      "welcome": "Welcome, {user}!",
      "cta": {
        "start": "Get Started",
        "copy": "Copy Link"
      }
    };
    setSourceMessages(JSON.stringify(sample, null, 2));
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Languages className="h-6 w-6 text-primary" />
            <CardTitle>AI Translation Manager</CardTitle>
          </div>
          <CardDescription>
            Automatically translate your English JSON messages to {targetLanguages.length} languages using ChatGPT API
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium">English Messages (JSON)</label>
              <Button variant="outline" size="sm" onClick={loadSampleData}>
                Load Sample
              </Button>
            </div>
            <Textarea
              placeholder="Paste your English JSON messages here..."
              value={sourceMessages}
              onChange={(e) => setSourceMessages(e.target.value)}
              className="min-h-[200px] font-mono"
            />
          </div>

          <div className="flex space-x-2">
            <Button 
              onClick={handleTranslate}
              disabled={isTranslating || !sourceMessages.trim()}
              className="flex-1"
            >
              {isTranslating ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2" />
                  Translating...
                </>
              ) : (
                <>
                  <Languages className="h-4 w-4 mr-2" />
                  Translate to {targetLanguages.length} Languages
                </>
              )}
            </Button>
            
            {Object.keys(translations).length > 0 && (
              <Button variant="outline" onClick={downloadTranslations}>
                <Download className="h-4 w-4 mr-2" />
                Download All
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {Object.keys(translations).length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {targetLanguages.map((lang) => (
            <Card key={lang}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center">
                    {languageNames[lang as keyof typeof languageNames]}
                    <Badge variant="secondary" className="ml-2">{lang.toUpperCase()}</Badge>
                  </CardTitle>
                  {translations[lang] ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-yellow-500" />
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {translations[lang] ? (
                  <pre className="text-xs bg-muted p-3 rounded max-h-[300px] overflow-auto">
                    {JSON.stringify(translations[lang], null, 2)}
                  </pre>
                ) : (
                  <div className="text-sm text-muted-foreground italic">
                    Translation not available
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card className="bg-muted/30">
        <CardHeader>
          <CardTitle className="text-lg">Translation Guidelines</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex items-start space-x-2">
            <Badge variant="outline" className="mt-0.5">1</Badge>
            <span>Keep placeholders like <code>{'{user}'}</code>, <code>{'{amount}'}</code> unchanged</span>
          </div>
          <div className="flex items-start space-x-2">
            <Badge variant="outline" className="mt-0.5">2</Badge>
            <span>UI labels should remain concise (1-3 words)</span>
          </div>
          <div className="flex items-start space-x-2">
            <Badge variant="outline" className="mt-0.5">3</Badge>
            <span>Professional tone appropriate for financial services</span>
          </div>
          <div className="flex items-start space-x-2">
            <Badge variant="outline" className="mt-0.5">4</Badge>
            <span>Check for <code>__MISSING__</code> values and manually fix if needed</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}