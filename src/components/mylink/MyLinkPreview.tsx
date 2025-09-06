import { MyLinkPage } from '@/lib/types/mylink';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  ExternalLink, 
  MessageCircle, 
  Youtube, 
  Twitter, 
  Mail,
  Globe,
  Wallet
} from 'lucide-react';

interface MyLinkPreviewProps {
  data: MyLinkPage;
}

export function MyLinkPreview({ data }: MyLinkPreviewProps) {
  const heroSection = data.sections.find(s => s.type === 'hero');
  const exchangesSection = data.sections.find(s => s.type === 'exchanges');
  const productsSection = data.sections.find(s => s.type === 'products');
  const leadSection = data.sections.find(s => s.type === 'lead');
  const socialSection = data.sections.find(s => s.type === 'social');
  const walletSection = data.sections.find(s => s.type === 'wallet');

  const getSocialIcon = (kind: string) => {
    switch (kind) {
      case 'telegram': return <MessageCircle className="w-4 h-4" />;
      case 'youtube': return <Youtube className="w-4 h-4" />;
      case 'x': return <Twitter className="w-4 h-4" />;
      case 'email': return <Mail className="w-4 h-4" />;
      case 'site': return <Globe className="w-4 h-4" />;
      default: return <ExternalLink className="w-4 h-4" />;
    }
  };

  return (
    <div className="w-full h-full overflow-y-auto bg-gradient-to-br from-background to-muted/20">
      <div className="p-6 space-y-6">
        
        {/* Hero Section */}
        {heroSection?.show && (
          <Card className="text-center">
            <CardContent className="p-6">
              <Avatar className="w-20 h-20 mx-auto mb-4">
                <AvatarImage src={data.avatarUrl} />
                <AvatarFallback className="text-lg">
                  {data.title.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <h1 className="text-2xl font-bold mb-2" style={{ color: data.theme.primary }}>
                {data.title}
              </h1>
              
              {data.bio && (
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  {data.bio}
                </p>
              )}
              
              {heroSection.badges && heroSection.badges.length > 0 && (
                <div className="flex flex-wrap justify-center gap-2">
                  {heroSection.badges.map((badge, index) => (
                    <Badge key={index} variant="secondary">
                      {badge}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Exchanges Section */}
        {exchangesSection?.show && exchangesSection.items.length > 0 && (
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4">거래소 시작하기</h2>
              <div className="space-y-3">
                {exchangesSection.items.map((item, index) => (
                  <Button
                    key={index}
                    className="w-full h-12 text-left justify-start"
                    variant={item.chosenMode === 'approved' ? 'default' : 'outline'}
                    style={item.chosenMode === 'approved' ? { backgroundColor: data.theme.primary } : {}}
                  >
                    <ExternalLink className="w-4 h-4 mr-3" />
                    <div className="flex-1">
                      <div className="font-medium">
                        {item.buttonLabel || `${item.exchangeId} 거래소`}
                      </div>
                      <div className="text-xs opacity-70">
                        {item.chosenMode === 'approved' ? '승인 요율' : '기본 요율'}
                      </div>
                    </div>
                    <Badge variant={item.chosenMode === 'approved' ? 'secondary' : 'outline'}>
                      {item.chosenMode === 'approved' ? '85%' : '25%'}
                    </Badge>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Products Section */}
        {productsSection?.show && productsSection.items.length > 0 && (
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4">추천 상품</h2>
              <div className="space-y-4">
                {productsSection.items.map((item, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium">상품 #{item.productId}</h3>
                      <Badge variant="outline">USDT</Badge>
                    </div>
                    {item.highlight && (
                      <p className="text-sm text-muted-foreground mb-3">
                        {item.highlight}
                      </p>
                    )}
                    <Button 
                      size="sm" 
                      className="w-full"
                      style={{ backgroundColor: data.theme.primary }}
                    >
                      {item.ctaLabel || '자세히 보기'}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Lead Section */}
        {leadSection?.show && leadSection.capture.kind !== 'none' && (
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4">
                {leadSection.capture.title || '무료 상담 신청'}
              </h2>
              {leadSection.capture.note && (
                <p className="text-sm text-muted-foreground mb-4">
                  {leadSection.capture.note}
                </p>
              )}
              <div className="space-y-3">
                {leadSection.capture.kind === 'email' && (
                  <div className="flex gap-2">
                    <input 
                      type="email" 
                      placeholder="이메일 주소" 
                      className="flex-1 px-3 py-2 border rounded-md text-sm"
                    />
                    <Button style={{ backgroundColor: data.theme.primary }}>
                      신청
                    </Button>
                  </div>
                )}
                {leadSection.capture.kind === 'telegram' && (
                  <Button 
                    className="w-full"
                    style={{ backgroundColor: data.theme.primary }}
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    텔레그램으로 문의
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Social Section */}
        {socialSection?.show && socialSection.links.length > 0 && (
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4">연락처 & 소셜</h2>
              <div className="grid grid-cols-2 gap-3">
                {socialSection.links.map((link, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="h-12"
                    onClick={() => window.open(link.url, '_blank')}
                  >
                    {getSocialIcon(link.kind)}
                    <span className="ml-2 capitalize">{link.kind}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Wallet Section */}
        {walletSection?.show && (
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4">지갑 연결</h2>
              <Button 
                className="w-full h-12"
                variant="outline"
              >
                <Wallet className="w-4 h-4 mr-2" />
                메타마스크 연결
              </Button>
              {walletSection.showCtossBalance && (
                <div className="mt-4 text-center">
                  <p className="text-sm text-muted-foreground">CTOSS 보유량</p>
                  <p className="text-lg font-semibold" style={{ color: data.theme.primary }}>
                    1,250 CTOSS
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="text-center py-4 border-t">
          <p className="text-xs text-muted-foreground">
            Powered by CoinToss
          </p>
        </div>
      </div>
    </div>
  );
}