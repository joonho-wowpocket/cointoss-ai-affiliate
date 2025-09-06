import { useState, useEffect } from 'react';
import { Product, ProductPost } from '@/lib/types/marketplace';
import { marketplaceApi } from '@/lib/api/marketplace';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { USDTPaymentModal } from './USDTPaymentModal';
import { useAuth } from '@/contexts/AuthContext';
import { LoginModal } from '@/components/auth/LoginModal';
import { 
  Signal, 
  FileText, 
  Bot, 
  GraduationCap,
  Clock,
  TrendingUp,
  Star,
  Users,
  ChevronRight,
  Plus,
  Eye,
  Download,
  Calendar,
  DollarSign,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ProductDetailProps {
  product: Product;
}

export function ProductDetail({ product }: ProductDetailProps) {
  const { isGuest } = useAuth();
  const [posts, setPosts] = useState<ProductPost[]>([]);
  const [hasSubscription, setHasSubscription] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [paymentModal, setPaymentModal] = useState({ isOpen: false });
  const [subscribing, setSubscribing] = useState(false);

  useEffect(() => {
    loadProductData();
  }, [product.id]);

  const loadProductData = async () => {
    try {
      setLoading(true);
      const [postsData, subscriptionStatus] = await Promise.all([
        marketplaceApi.getProductPosts(product.id),
        isGuest ? Promise.resolve(false) : marketplaceApi.hasActiveSubscription(product.id)
      ]);
      setPosts(postsData);
      setHasSubscription(subscriptionStatus);
    } catch (error) {
      console.error('Failed to load product data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = () => {
    if (isGuest) {
      setShowLoginModal(true);
      return;
    }
    setPaymentModal({ isOpen: true });
  };

  const handleAddToMyLink = async () => {
    if (isGuest) {
      setShowLoginModal(true);
      return;
    }

    try {
      await marketplaceApi.addToMyLink(product.id);
      toast({
        description: "MyLink에 상품이 추가되었습니다."
      });
    } catch (error) {
      toast({
        variant: "destructive",
        description: "MyLink 추가에 실패했습니다."
      });
    }
  };

  const handlePaymentSubmit = async (txHash: string) => {
    try {
      setSubscribing(true);
      await marketplaceApi.createSubscription(product.id, txHash);
      toast({
        description: "구독 신청이 완료되었습니다. 결제 확인 후 활성화됩니다."
      });
      setPaymentModal({ isOpen: false });
      setHasSubscription(true);
    } catch (error) {
      console.error('Subscription failed:', error);
      toast({
        variant: "destructive",
        description: "구독 신청에 실패했습니다."
      });
    } finally {
      setSubscribing(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'signals': return <Signal className="w-5 h-5" />;
      case 'research': return <FileText className="w-5 h-5" />;
      case 'bot': return <Bot className="w-5 h-5" />;
      case 'education': return <GraduationCap className="w-5 h-5" />;
      default: return <Signal className="w-5 h-5" />;
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'signals': return '시그널';
      case 'research': return '리서치';
      case 'bot': return '봇';
      case 'education': return '교육';
      default: return category;
    }
  };

  const getDeliveryCycleLabel = (cycle?: string) => {
    switch (cycle) {
      case 'realtime': return '실시간';
      case 'daily': return '일간';
      case 'weekly': return '주간';
      case 'monthly': return '월간';
      default: return '';
    }
  };

  const previewPosts = posts.filter(p => p.visibility === 'preview').slice(0, 3);
  const subscriberPosts = posts.filter(p => p.visibility === 'subscribers');

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <Card className="overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
          {/* Product Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-start justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className="flex items-center gap-1">
                    {getCategoryIcon(product.category)}
                    {getCategoryLabel(product.category)}
                  </Badge>
                  {product.delivery_cycle && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {getDeliveryCycleLabel(product.delivery_cycle)}
                    </Badge>
                  )}
                </div>
                
                <h1 className="text-3xl font-bold">{product.title}</h1>
                
                {product.summary && (
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    {product.summary}
                  </p>
                )}
              </div>
            </div>

            {/* Metrics */}
            {product.metrics && Object.keys(product.metrics).length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {product.metrics.winRate && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-green-700">
                      {product.metrics.winRate}%
                    </div>
                    <div className="text-sm text-green-600">승률</div>
                  </div>
                )}
                {product.metrics.roi && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-blue-700">
                      {product.metrics.roi}%
                    </div>
                    <div className="text-sm text-blue-600">ROI</div>
                  </div>
                )}
                {product.metrics.subscribers && (
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-purple-700">
                      {product.metrics.subscribers}
                    </div>
                    <div className="text-sm text-purple-600">구독자</div>
                  </div>
                )}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                  <div className="flex items-center justify-center gap-1 text-2xl font-bold text-yellow-700">
                    <Star className="w-5 h-5 fill-current" />
                    4.8
                  </div>
                  <div className="text-sm text-yellow-600">평점</div>
                </div>
              </div>
            )}
          </div>

          {/* Pricing & Actions */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardContent className="p-6 space-y-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">
                    ${product.price_usdt}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    /{product.billing_period === 'monthly' ? '월' : product.billing_period}
                  </div>
                </div>

                <div className="space-y-3">
                  {hasSubscription ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="font-medium text-green-800">구독 중</span>
                      </div>
                      <Button 
                        onClick={handleAddToMyLink}
                        variant="outline" 
                        className="w-full"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        MyLink에 추가
                      </Button>
                    </div>
                  ) : (
                    <Button 
                      onClick={handleSubscribe}
                      className="w-full h-12 text-lg"
                    >
                      <DollarSign className="w-5 h-5 mr-2" />
                      USDT로 구독하기
                    </Button>
                  )}

                  {isGuest && (
                    <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <AlertTriangle className="w-4 h-4 text-blue-600 mt-0.5" />
                      <div className="text-sm text-blue-700">
                        구독하려면 <button 
                          onClick={() => setShowLoginModal(true)}
                          className="font-medium underline"
                        >
                          로그인
                        </button>이 필요합니다.
                      </div>
                    </div>
                  )}
                </div>

                {/* Vendor Info */}
                {product.vendor && (
                  <div className="pt-4 border-t space-y-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={product.vendor.logo_url} />
                        <AvatarFallback>
                          {product.vendor.display_name?.charAt(0) || 'V'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{product.vendor.display_name}</div>
                        <div className="text-sm text-muted-foreground">판매자</div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </Card>

      {/* Cover Image */}
      {product.cover_image && (
        <Card>
          <CardContent className="p-0">
            <div className="aspect-video rounded-lg overflow-hidden">
              <img 
                src={product.cover_image} 
                alt={product.title}
                className="w-full h-full object-cover"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Description */}
      {product.description && (
        <Card>
          <CardHeader>
            <CardTitle>상품 소개</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              {product.description.split('\n').map((paragraph, index) => (
                <p key={index} className="mb-4 leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Preview Posts */}
      {previewPosts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              미리보기
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {previewPosts.map((post) => (
                <div key={post.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium">{post.title}</h3>
                    <Badge variant="outline">미리보기</Badge>
                  </div>
                  {post.body && (
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {post.body}
                    </p>
                  )}
                  <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(post.published_at).toLocaleDateString()}
                    </span>
                    {post.attachments.length > 0 && (
                      <span className="flex items-center gap-1">
                        <Download className="w-3 h-3" />
                        {post.attachments.length}개 첨부파일
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Subscriber Content */}
      {hasSubscription && subscriberPosts.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                구독자 전용 콘텐츠
              </CardTitle>
              <Badge className="bg-green-100 text-green-800">
                {subscriberPosts.length}개 포스트
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {subscriberPosts.slice(0, 5).map((post) => (
                <div key={post.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium">{post.title}</h3>
                    <Badge className="bg-green-100 text-green-800">구독자 전용</Badge>
                  </div>
                  {post.body && (
                    <div className="text-sm mb-3 leading-relaxed">
                      {post.body}
                    </div>
                  )}
                  {post.attachments.length > 0 && (
                    <div className="flex gap-2">
                      {post.attachments.map((attachment, index) => (
                        <Button 
                          key={index}
                          size="sm" 
                          variant="outline"
                          onClick={() => window.open(attachment.url, '_blank')}
                        >
                          <Download className="w-3 h-3 mr-1" />
                          {attachment.name || `첨부파일 ${index + 1}`}
                        </Button>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(post.published_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modals */}
      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)} 
      />
      
      <USDTPaymentModal
        isOpen={paymentModal.isOpen}
        onClose={() => setPaymentModal({ isOpen: false })}
        product={product}
        onPaymentSubmit={handlePaymentSubmit}
        isSubmitting={subscribing}
      />
    </div>
  );
}