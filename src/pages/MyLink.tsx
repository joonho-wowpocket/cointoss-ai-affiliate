import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MyLinkBuilder } from '@/components/mylink/MyLinkBuilder';
import { MyLinkPage } from '@/lib/types/mylink';
import { Plus, ExternalLink, Edit, Eye, Share2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { GuestBanner } from '@/components/GuestBanner';

export default function MyLink() {
  const { isGuest } = useAuth();
  const [showBuilder, setShowBuilder] = useState(false);
  const [myLinks, setMyLinks] = useState<MyLinkPage[]>([]);
  const [selectedLink, setSelectedLink] = useState<MyLinkPage | null>(null);

  const handleCreateNew = () => {
    if (isGuest) {
      // Show login modal
      return;
    }
    setSelectedLink(null);
    setShowBuilder(true);
  };

  const handleEdit = (link: MyLinkPage) => {
    if (isGuest) {
      // Show login modal
      return;
    }
    setSelectedLink(link);
    setShowBuilder(true);
  };

  const handleSave = (data: MyLinkPage) => {
    // TODO: API call to save
    console.log('Saving MyLink:', data);
    setShowBuilder(false);
  };

  const handlePublish = (data: MyLinkPage) => {
    // TODO: API call to publish
    console.log('Publishing MyLink:', data);
    setShowBuilder(false);
  };

  if (showBuilder) {
    return (
      <MyLinkBuilder
        initialData={selectedLink || undefined}
        onSave={handleSave}
        onPublish={handlePublish}
      />
    );
  }

  return (
    <div className="container mx-auto px-6 py-8">
      {isGuest && <GuestBanner onLoginClick={() => {}} />}
      
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">MyLink</h1>
            <p className="text-muted-foreground mt-2">
              나만의 링크인바이오를 만들어 고객과 만나세요
            </p>
          </div>
          
          <Button 
            onClick={handleCreateNew}
            className="bg-primary hover:bg-primary/90"
          >
            <Plus className="w-4 h-4 mr-2" />
            새 링크 만들기
          </Button>
        </div>

        {/* Sample Links for Demo */}
        {isGuest && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary">샘플</Badge>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="ghost">
                      <Share2 className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="ghost">
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <CardTitle className="text-lg">크립토 파트너</CardTitle>
                <p className="text-sm text-muted-foreground">
                  거래소 전문가와 함께하는 투자 여정
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">상태</span>
                    <Badge variant="outline" className="text-green-600">공개됨</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">조회수</span>
                    <span className="font-medium">1,234</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">클릭수</span>
                    <span className="font-medium">89</span>
                  </div>
                  <div className="pt-2 border-t">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="w-full"
                      onClick={() => window.open('https://cointoss.page/crypto-partner', '_blank')}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      미리보기
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary">샘플</Badge>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="ghost">
                      <Share2 className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="ghost">
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <CardTitle className="text-lg">트레이딩 멘토</CardTitle>
                <p className="text-sm text-muted-foreground">
                  실전 트레이딩 교육 및 시그널 서비스
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">상태</span>
                    <Badge variant="secondary">초안</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">조회수</span>
                    <span className="font-medium">—</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">클릭수</span>
                    <span className="font-medium">—</span>
                  </div>
                  <div className="pt-2 border-t">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="w-full"
                      disabled
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      미리보기
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-dashed border-2 hover:border-primary/50 transition-colors">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Plus className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">새 링크 만들기</h3>
                <p className="text-sm text-muted-foreground text-center mb-4">
                  3분 만에 나만의 링크인바이오를 만들어보세요
                </p>
                <Button onClick={handleCreateNew}>
                  시작하기
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Features Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <ExternalLink className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">거래소 연동</h3>
                <p className="text-sm text-muted-foreground">
                  기본/승인 링크를 하나의 페이지에서 관리하고 고객 유치
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Share2 className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">상품 마케팅</h3>
                <p className="text-sm text-muted-foreground">
                  마켓플레이스 상품을 선택해서 고객에게 직접 판매
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Eye className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">실시간 분석</h3>
                <p className="text-sm text-muted-foreground">
                  방문자, 클릭, 전환 데이터를 실시간으로 확인
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Getting Started */}
        <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="p-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">링크인바이오로 수익을 늘려보세요</h2>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                하나의 링크로 거래소 추천, 상품 판매, 고객 관리를 모두 해결하세요. 
                모바일 최적화된 페이지로 어디서든 쉽게 공유할 수 있습니다.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" onClick={handleCreateNew}>
                  <Plus className="w-5 h-5 mr-2" />
                  무료로 시작하기
                </Button>
                <Button size="lg" variant="outline">
                  <ExternalLink className="w-5 h-5 mr-2" />
                  샘플 보기
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}