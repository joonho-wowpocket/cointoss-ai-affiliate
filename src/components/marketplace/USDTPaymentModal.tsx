import { useState } from 'react';
import { Product } from '@/lib/types/marketplace';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Copy, ExternalLink, CheckCircle, AlertTriangle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface USDTPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  onPaymentSubmit: (txHash: string) => void;
  isSubmitting?: boolean;
}

export function USDTPaymentModal({ 
  isOpen, 
  onClose, 
  product, 
  onPaymentSubmit,
  isSubmitting = false 
}: USDTPaymentModalProps) {
  const [txHash, setTxHash] = useState('');
  const [step, setStep] = useState<'payment' | 'verify'>('payment');

  // Mock USDT payment address - in real app, this would come from backend
  const paymentAddress = "TQn9Y2khEsLJW1ChVWFMSMeRDow5KcbLSE";
  const amount = product.price_usdt;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      description: `${label}이(가) 클립보드에 복사되었습니다.`
    });
  };

  const handleSubmit = () => {
    if (!txHash.trim()) {
      toast({
        variant: "destructive",
        description: "트랜잭션 해시를 입력해주세요."
      });
      return;
    }
    onPaymentSubmit(txHash);
  };

  const openTronScan = () => {
    if (txHash) {
      window.open(`https://tronscan.org/#/transaction/${txHash}`, '_blank');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            USDT 결제
            <Badge variant="outline">TRC20</Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Product Info */}
          <Card className="bg-muted/50">
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium line-clamp-2">{product.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {product.billing_period === 'monthly' ? '월간 구독' : product.billing_period}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-primary">
                    {amount} USDT
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {step === 'payment' && (
            <>
              {/* Payment Instructions */}
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-blue-800 mb-1">결제 안내</p>
                      <p className="text-blue-700">
                        TRC20 네트워크로만 USDT를 보내주세요. 
                        다른 네트워크 사용 시 자산이 손실될 수 있습니다.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Payment Address */}
                <div>
                  <Label>입금 주소 (TRC20)</Label>
                  <div className="flex gap-2 mt-1">
                    <Input 
                      value={paymentAddress} 
                      readOnly 
                      className="font-mono text-sm"
                    />
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => copyToClipboard(paymentAddress, '입금 주소')}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Amount */}
                <div>
                  <Label>입금 금액</Label>
                  <div className="flex gap-2 mt-1">
                    <Input 
                      value={`${amount} USDT`}
                      readOnly 
                      className="font-mono text-sm"
                    />
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => copyToClipboard(amount.toString(), '입금 금액')}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={onClose}
                  className="flex-1"
                >
                  취소
                </Button>
                <Button 
                  onClick={() => setStep('verify')}
                  className="flex-1"
                >
                  입금 완료
                </Button>
              </div>
            </>
          )}

          {step === 'verify' && (
            <>
              {/* Transaction Hash Input */}
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-green-800 mb-1">입금 완료</p>
                      <p className="text-green-700">
                        트랜잭션 해시를 입력하여 결제를 완료해주세요.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <Label>트랜잭션 해시 (TX Hash)</Label>
                  <Input 
                    value={txHash}
                    onChange={(e) => setTxHash(e.target.value)}
                    placeholder="0x..."
                    className="font-mono text-sm mt-1"
                  />
                  {txHash && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={openTronScan}
                      className="mt-2 h-8 px-2"
                    >
                      <ExternalLink className="w-3 h-3 mr-1" />
                      TronScan에서 확인
                    </Button>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setStep('payment')}
                  className="flex-1"
                >
                  이전
                </Button>
                <Button 
                  onClick={handleSubmit}
                  disabled={!txHash.trim() || isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting ? '처리중...' : '구독 완료'}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}