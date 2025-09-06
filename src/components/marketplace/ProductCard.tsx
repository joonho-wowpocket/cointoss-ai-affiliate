import { Product } from '@/lib/types/marketplace';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Signal, 
  FileText, 
  Bot, 
  GraduationCap,
  Clock,
  TrendingUp,
  ExternalLink
} from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onClick?: () => void;
  showVendor?: boolean;
}

export function ProductCard({ product, onClick, showVendor = true }: ProductCardProps) {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'signals': return <Signal className="w-4 h-4" />;
      case 'research': return <FileText className="w-4 h-4" />;
      case 'bot': return <Bot className="w-4 h-4" />;
      case 'education': return <GraduationCap className="w-4 h-4" />;
      default: return <Signal className="w-4 h-4" />;
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

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 cursor-pointer border hover:border-primary/20" onClick={onClick}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
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
          <div className="text-right">
            <div className="text-lg font-bold text-primary">
              ${product.price_usdt}
            </div>
            <div className="text-xs text-muted-foreground">
              /{product.billing_period === 'monthly' ? '월' : product.billing_period}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Cover Image */}
        {product.cover_image && (
          <div className="aspect-video rounded-lg overflow-hidden bg-muted">
            <img 
              src={product.cover_image} 
              alt={product.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            />
          </div>
        )}

        {/* Title and Summary */}
        <div>
          <CardTitle className="text-lg group-hover:text-primary transition-colors line-clamp-2">
            {product.title}
          </CardTitle>
          {product.summary && (
            <p className="text-sm text-muted-foreground mt-2 line-clamp-3">
              {product.summary}
            </p>
          )}
        </div>

        {/* Metrics */}
        {product.metrics && Object.keys(product.metrics).length > 0 && (
          <div className="flex flex-wrap gap-2">
            {product.metrics.winRate && (
              <div className="flex items-center gap-1 text-xs bg-green-50 text-green-700 px-2 py-1 rounded">
                <TrendingUp className="w-3 h-3" />
                승률 {product.metrics.winRate}%
              </div>
            )}
            {product.metrics.roi && (
              <div className="flex items-center gap-1 text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                ROI {product.metrics.roi}%
              </div>
            )}
          </div>
        )}

        {/* Vendor Info */}
        {showVendor && product.vendor && (
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center gap-2">
              <Avatar className="w-6 h-6">
                <AvatarImage src={product.vendor.logo_url} />
                <AvatarFallback className="text-xs">
                  {product.vendor.display_name?.charAt(0) || 'V'}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-muted-foreground">
                {product.vendor.display_name}
              </span>
            </div>
            
            <Button 
              size="sm" 
              variant="ghost" 
              className="opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                onClick?.();
              }}
            >
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}