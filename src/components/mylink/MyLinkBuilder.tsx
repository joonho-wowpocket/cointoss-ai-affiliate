import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { MyLinkPage, Section } from '@/lib/types/mylink';
import { MyLinkPreview } from './MyLinkPreview';
import { SectionEditor } from './SectionEditor';
import { 
  Monitor, 
  Smartphone, 
  Eye, 
  Share2, 
  QrCode,
  Settings,
  Palette,
  Globe
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface MyLinkBuilderProps {
  initialData?: Partial<MyLinkPage>;
  onSave?: (data: MyLinkPage) => void;
  onPublish?: (data: MyLinkPage) => void;
}

export function MyLinkBuilder({ initialData, onSave, onPublish }: MyLinkBuilderProps) {
  const { user } = useAuth();
  const [previewMode, setPreviewMode] = useState<'mobile' | 'desktop'>('mobile');
  const [activeTab, setActiveTab] = useState<'sections' | 'settings' | 'theme'>('sections');
  
  const [mylinkData, setMylinkData] = useState<MyLinkPage>({
    id: initialData?.id || crypto.randomUUID(),
    partnerId: user?.id || '',
    slug: initialData?.slug || '',
    title: initialData?.title || '내 링크',
    bio: initialData?.bio || '',
    avatarUrl: initialData?.avatarUrl,
    theme: initialData?.theme || {
      mode: 'light',
      primary: '#FFD700'
    },
    locale: initialData?.locale || 'ko',
    sections: initialData?.sections || [
      { type: 'hero', show: true },
      { type: 'exchanges', show: true, items: [] },
      { type: 'products', show: false, items: [] },
      { type: 'lead', show: false, capture: { kind: 'none' } },
      { type: 'social', show: false, links: [] },
      { type: 'wallet', show: false }
    ],
    published: initialData?.published || false,
    publishedAt: initialData?.publishedAt,
    seo: initialData?.seo,
    createdAt: initialData?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  const updateField = (field: keyof MyLinkPage, value: any) => {
    setMylinkData(prev => ({
      ...prev,
      [field]: value,
      updatedAt: new Date().toISOString()
    }));
  };

  const updateSection = (index: number, section: Section) => {
    const newSections = [...mylinkData.sections];
    newSections[index] = section;
    updateField('sections', newSections);
  };

  const toggleSection = (index: number) => {
    const newSections = [...mylinkData.sections];
    newSections[index] = { ...newSections[index], show: !newSections[index].show };
    updateField('sections', newSections);
  };

  const handleSave = () => {
    onSave?.(mylinkData);
  };

  const handlePublish = () => {
    const publishedData = {
      ...mylinkData,
      published: true,
      publishedAt: new Date().toISOString()
    };
    setMylinkData(publishedData);
    onPublish?.(publishedData);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top Bar */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold">MyLink 편집기</h1>
            <Badge variant={mylinkData.published ? "default" : "secondary"}>
              {mylinkData.published ? '공개됨' : '초안'}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Eye className="w-4 h-4 mr-2" />
              미리보기
            </Button>
            <Button variant="outline" size="sm">
              <QrCode className="w-4 h-4 mr-2" />
              QR코드
            </Button>
            <Button variant="outline" size="sm">
              <Share2 className="w-4 h-4 mr-2" />
              공유
            </Button>
            <Button onClick={handleSave} size="sm">
              저장
            </Button>
            <Button onClick={handlePublish} variant="default" size="sm">
              공개
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-6">
        <div className="grid grid-cols-12 gap-6 h-[calc(100vh-200px)]">
          {/* Left Sidebar - Sections */}
          <div className="col-span-3">
            <Card className="h-full">
              <CardHeader>
                <Tabs value={activeTab} onValueChange={setActiveTab as any}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="sections">섹션</TabsTrigger>
                    <TabsTrigger value="settings">
                      <Settings className="w-4 h-4" />
                    </TabsTrigger>
                    <TabsTrigger value="theme">
                      <Palette className="w-4 h-4" />
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <TabsContent value="sections" className="space-y-3 mt-0">
                  {mylinkData.sections.map((section, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={section.show}
                          onCheckedChange={() => toggleSection(index)}
                        />
                        <span className="font-medium capitalize">
                          {section.type === 'hero' && '프로필'}
                          {section.type === 'exchanges' && '거래소'}
                          {section.type === 'products' && '상품'}
                          {section.type === 'lead' && '문의'}
                          {section.type === 'social' && '소셜'}
                          {section.type === 'wallet' && '지갑'}
                        </span>
                      </div>
                    </div>
                  ))}
                </TabsContent>
                
                <TabsContent value="settings" className="space-y-4 mt-0">
                  <div>
                    <Label htmlFor="title">페이지 제목</Label>
                    <Input
                      id="title"
                      value={mylinkData.title}
                      onChange={(e) => updateField('title', e.target.value)}
                      placeholder="내 링크"
                    />
                  </div>
                  <div>
                    <Label htmlFor="slug">URL 슬러그</Label>
                    <Input
                      id="slug"
                      value={mylinkData.slug}
                      onChange={(e) => updateField('slug', e.target.value)}
                      placeholder="my-link"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      cointoss.page/{mylinkData.slug}
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="bio">한줄 소개</Label>
                    <Textarea
                      id="bio"
                      value={mylinkData.bio}
                      onChange={(e) => updateField('bio', e.target.value)}
                      placeholder="크립토 파트너와 함께하는 투자 여정"
                      rows={3}
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="theme" className="space-y-4 mt-0">
                  <div>
                    <Label>테마 모드</Label>
                    <div className="flex gap-2 mt-2">
                      <Button
                        variant={mylinkData.theme.mode === 'light' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => updateField('theme', { ...mylinkData.theme, mode: 'light' })}
                      >
                        라이트
                      </Button>
                      <Button
                        variant={mylinkData.theme.mode === 'dark' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => updateField('theme', { ...mylinkData.theme, mode: 'dark' })}
                      >
                        다크
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="primary-color">메인 컬러</Label>
                    <Input
                      id="primary-color"
                      type="color"
                      value={mylinkData.theme.primary}
                      onChange={(e) => updateField('theme', { ...mylinkData.theme, primary: e.target.value })}
                    />
                  </div>
                </TabsContent>
              </CardContent>
            </Card>
          </div>

          {/* Center - Preview */}
          <div className="col-span-6">
            <Card className="h-full">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">미리보기</CardTitle>
                  <div className="flex gap-1 border rounded-lg p-1">
                    <Button
                      variant={previewMode === 'mobile' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setPreviewMode('mobile')}
                    >
                      <Smartphone className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={previewMode === 'desktop' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setPreviewMode('desktop')}
                    >
                      <Monitor className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0 h-full">
                <div className="h-full flex items-center justify-center bg-muted/20">
                  <div className={`
                    ${previewMode === 'mobile' ? 'w-80 h-[600px]' : 'w-full h-full max-w-4xl'} 
                    bg-background border rounded-lg overflow-hidden shadow-lg
                  `}>
                    <MyLinkPreview data={mylinkData} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar - Section Editor */}
          <div className="col-span-3">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="text-lg">섹션 편집</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <SectionEditor
                  sections={mylinkData.sections}
                  onSectionUpdate={updateSection}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}