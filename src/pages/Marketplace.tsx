import { useState, useEffect } from 'react';
import { Product, MarketplaceFilters } from '@/lib/types/marketplace';
import { marketplaceApi } from '@/lib/api/marketplace';
import { ProductCard } from '@/components/marketplace/ProductCard';
import { MarketplaceFilters as FiltersComponent } from '@/components/marketplace/MarketplaceFilters';
import { USDTPaymentModal } from '@/components/marketplace/USDTPaymentModal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';
import { GuestBanner } from '@/components/GuestBanner';
import { LoginModal } from '@/components/auth/LoginModal';
import { useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, 
  TrendingUp, 
  Users, 
  Star,
  Search,
  ExternalLink
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function Marketplace() {
  const { isGuest } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<MarketplaceFilters>({});
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [paymentModal, setPaymentModal] = useState<{
    isOpen: boolean;
    product?: Product;
  }>({ isOpen: false });
  const [subscribing, setSubscribing] = useState(false);

  useEffect(() => {
    loadProducts();
  }, [filters]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await marketplaceApi.getProducts(filters);
      setProducts(data);
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProductClick = (product: Product) => {
    navigate(`/marketplace/${product.slug}`);
  };

  const handlePaymentSubmit = async (txHash: string) => {
    if (!paymentModal.product) return;

    try {
      setSubscribing(true);
      await marketplaceApi.createSubscription(paymentModal.product.id, txHash);
      toast({
        description: "구독 신청이 완료되었습니다."
      });
      setPaymentModal({ isOpen: false });
    } catch (error) {
      toast({
        variant: "destructive",
        description: "구독 신청에 실패했습니다."
      });
    } finally {
      setSubscribing(false);
    }
  };

  // Sample data for demo - Investment products for partners to sell
  const sampleProducts: Product[] = [
    {
      id: '1', vendor_id: '1', title: '프리미엄 비트코인 시그널', slug: 'bitcoin-signals',
      category: 'signals', summary: '전문 트레이더의 실시간 비트코인 매매 시그널',
      delivery_cycle: 'realtime', price_usdt: 99, billing_period: 'monthly',
      cover_image: '/lovable-uploads/b87806bb-bc85-45d0-b917-7b682bb7fb00.png',
      metrics: { winRate: 78, roi: 156, subscribers: 1250 }, status: 'published',
      created_at: '2024-01-01', updated_at: '2024-01-01',
      vendor: { id: '1', user_id: '1', display_name: '크립토마스터', logo_url: '/lovable-uploads/b87806bb-bc85-45d0-b917-7b682bb7fb00.png',
        status: 'active', created_at: '2024-01-01', updated_at: '2024-01-01' }
    },
    {
      id: '2', vendor_id: '2', title: 'AI 자동매매 봇 - 알트코인', slug: 'altcoin-trading-bot',
      category: 'bot', summary: '24/7 AI 알고리즘 기반 알트코인 자동 매매',
      delivery_cycle: 'realtime', price_usdt: 199, billing_period: 'monthly',
      cover_image: '/lovable-uploads/b87806bb-bc85-45d0-b917-7b682bb7fb00.png',
      metrics: { winRate: 82, roi: 234, subscribers: 890 }, status: 'published',
      created_at: '2024-01-01', updated_at: '2024-01-01',
      vendor: { id: '2', user_id: '2', display_name: 'AI트레이딩팀', logo_url: '/lovable-uploads/b87806bb-bc85-45d0-b917-7b682bb7fb00.png',
        status: 'active', created_at: '2024-01-01', updated_at: '2024-01-01' }
    },
    {
      id: '3', vendor_id: '3', title: '데일리 마켓 리포트', slug: 'daily-market-report',
      category: 'research', summary: '매일 아침 업데이트되는 시장 분석 리포트',
      delivery_cycle: 'daily', price_usdt: 49, billing_period: 'monthly',
      cover_image: '/lovable-uploads/b87806bb-bc85-45d0-b917-7b682bb7fb00.png',
      metrics: { accuracy: 89, insights: 150, subscribers: 2100 }, status: 'published',
      created_at: '2024-01-01', updated_at: '2024-01-01',
      vendor: { id: '3', user_id: '3', display_name: '마켓인사이트', logo_url: '/lovable-uploads/b87806bb-bc85-45d0-b917-7b682bb7fb00.png',
        status: 'active', created_at: '2024-01-01', updated_at: '2024-01-01' }
    },
    {
      id: '4', vendor_id: '4', title: 'DeFi 수익 파밍 가이드', slug: 'defi-yield-farming',
      category: 'education', summary: 'DeFi 프로토콜 수익 극대화 전략 및 실습',
      delivery_cycle: 'weekly', price_usdt: 79, billing_period: 'monthly',
      cover_image: '/lovable-uploads/b87806bb-bc85-45d0-b917-7b682bb7fb00.png',
      metrics: { completion: 94, avgReturn: 18.5, subscribers: 650 }, status: 'published',
      created_at: '2024-01-01', updated_at: '2024-01-01',
      vendor: { id: '4', user_id: '4', display_name: 'DeFi전문가', logo_url: '/lovable-uploads/b87806bb-bc85-45d0-b917-7b682bb7fb00.png',
        status: 'active', created_at: '2024-01-01', updated_at: '2024-01-01' }
    },
    {
      id: '5', vendor_id: '5', title: '선물거래 마스터 클래스', slug: 'futures-masterclass',
      category: 'education', summary: '레버리지 거래부터 위험 관리까지 완벽 가이드',
      delivery_cycle: 'weekly', price_usdt: 149, billing_period: 'monthly',
      cover_image: '/lovable-uploads/b87806bb-bc85-45d0-b917-7b682bb7fb00.png',
      metrics: { winRate: 76, profitFactor: 2.8, subscribers: 420 }, status: 'published',
      created_at: '2024-01-01', updated_at: '2024-01-01',
      vendor: { id: '5', user_id: '5', display_name: '선물거래프로', logo_url: '/lovable-uploads/b87806bb-bc85-45d0-b917-7b682bb7fb00.png',
        status: 'active', created_at: '2024-01-01', updated_at: '2024-01-01' }
    },
    {
      id: '6', vendor_id: '6', title: '스윙 트레이딩 시그널', slug: 'swing-trading-signals',
      category: 'signals', summary: '중장기 트레이딩을 위한 스윙 트레이딩 시그널',
      delivery_cycle: 'daily', price_usdt: 69, billing_period: 'monthly',
      cover_image: '/lovable-uploads/b87806bb-bc85-45d0-b917-7b682bb7fb00.png',
      metrics: { winRate: 71, avgHoldTime: '5일', subscribers: 780 }, status: 'published',
      created_at: '2024-01-01', updated_at: '2024-01-01',
      vendor: { id: '6', user_id: '6', display_name: '스윙마스터', logo_url: '/lovable-uploads/b87806bb-bc85-45d0-b917-7b682bb7fb00.png',
        status: 'active', created_at: '2024-01-01', updated_at: '2024-01-01' }
    }
  ];

  const displayProducts = isGuest ? sampleProducts : products;

  return (
    <div className="container mx-auto px-6 py-8">
      {isGuest && <GuestBanner onLoginClick={() => setShowLoginModal(true)} />}
      
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <ShoppingBag className="w-8 h-8 text-primary" />
              마켓플레이스
            </h1>
            <p className="text-muted-foreground mt-2">
              전문가 상품을 구독하고 내 브랜드로 재가공하세요
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <FiltersComponent 
              filters={filters} 
              onFiltersChange={setFilters}
              onClearFilters={() => setFilters({})}
            />
          </div>

          <div className="lg:col-span-3">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i}>
                    <CardHeader>
                      <Skeleton className="h-4 w-3/4" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-40 w-full mb-4" />
                      <Skeleton className="h-4 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {displayProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onClick={() => handleProductClick(product)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)} 
      />
      
      {paymentModal.product && (
        <USDTPaymentModal
          isOpen={paymentModal.isOpen}
          onClose={() => setPaymentModal({ isOpen: false })}
          product={paymentModal.product}
          onPaymentSubmit={handlePaymentSubmit}
          isSubmitting={subscribing}
        />
      )}
    </div>
  );
}