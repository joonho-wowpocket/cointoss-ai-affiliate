import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Eye, 
  EyeOff, 
  Shield, 
  Calendar, 
  Mail, 
  Phone, 
  MessageCircle,
  User,
  Building
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { AdminGuard } from './AdminGuard';

interface LeadCapture {
  id: string;
  lead_magnet_id: string;
  partner_id: string;
  captured_at: string;
  source: string;
  ip_address?: string;
  user_agent?: string;
  contact_info?: {
    email?: string;
    phone?: string;
    telegram?: string;
    name?: string;
    company?: string;
    notes?: string;
    email_masked?: string;
    phone_masked?: string;
    telegram_masked?: string;
  };
}

export function SecureLeadCaptures() {
  const [captures, setCaptures] = useState<LeadCapture[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showMasked, setShowMasked] = useState(true);

  const fetchLeadCaptures = async (masked = true) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.functions.invoke('admin-lead-contacts', {
        body: {},
        method: 'GET'
      });

      if (error) throw error;

      setCaptures(data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching lead captures:', err);
      setError('Failed to fetch lead captures');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeadCaptures(showMasked);
  }, [showMasked]);

  const toggleMaskMode = () => {
    setShowMasked(!showMasked);
  };

  const renderContactInfo = (contactInfo: any) => {
    if (!contactInfo) return <span className="text-muted-foreground">No contact info</span>;

    const items = [];

    if (showMasked) {
      if (contactInfo.email_masked) {
        items.push(
          <div key="email" className="flex items-center gap-1">
            <Mail className="h-3 w-3" />
            <span className="font-mono text-xs">{contactInfo.email_masked}</span>
          </div>
        );
      }
      if (contactInfo.phone_masked) {
        items.push(
          <div key="phone" className="flex items-center gap-1">
            <Phone className="h-3 w-3" />
            <span className="font-mono text-xs">{contactInfo.phone_masked}</span>
          </div>
        );
      }
      if (contactInfo.telegram_masked) {
        items.push(
          <div key="telegram" className="flex items-center gap-1">
            <MessageCircle className="h-3 w-3" />
            <span className="font-mono text-xs">{contactInfo.telegram_masked}</span>
          </div>
        );
      }
    } else {
      if (contactInfo.email) {
        items.push(
          <div key="email" className="flex items-center gap-1">
            <Mail className="h-3 w-3" />
            <span className="text-xs">{contactInfo.email}</span>
          </div>
        );
      }
      if (contactInfo.phone) {
        items.push(
          <div key="phone" className="flex items-center gap-1">
            <Phone className="h-3 w-3" />
            <span className="text-xs">{contactInfo.phone}</span>
          </div>
        );
      }
      if (contactInfo.telegram) {
        items.push(
          <div key="telegram" className="flex items-center gap-1">
            <MessageCircle className="h-3 w-3" />
            <span className="text-xs">{contactInfo.telegram}</span>
          </div>
        );
      }
    }

    if (contactInfo.name) {
      items.push(
        <div key="name" className="flex items-center gap-1">
          <User className="h-3 w-3" />
          <span className="text-xs">{contactInfo.name}</span>
        </div>
      );
    }

    if (contactInfo.company) {
      items.push(
        <div key="company" className="flex items-center gap-1">
          <Building className="h-3 w-3" />
          <span className="text-xs">{contactInfo.company}</span>
        </div>
      );
    }

    return (
      <div className="space-y-1">
        {items.length > 0 ? items : <span className="text-muted-foreground text-xs">No contact details</span>}
      </div>
    );
  };

  if (loading) {
    return <div className="p-6">Loading lead captures...</div>;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <AdminGuard roles={['SuperAdmin', 'Ops', 'Compliance']}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">보안 리드 캡처</h2>
            <p className="text-muted-foreground">
              암호화된 연락처 정보 관리 (GDPR/개인정보보호법 준수)
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={showMasked ? "default" : "outline"}
              size="sm"
              onClick={toggleMaskMode}
            >
              {showMasked ? <EyeOff className="h-4 w-4 mr-1" /> : <Eye className="h-4 w-4 mr-1" />}
              {showMasked ? '마스킹됨' : '전체 보기'}
            </Button>
            <Button variant="outline" size="sm" onClick={() => fetchLeadCaptures(showMasked)}>
              새로고침
            </Button>
          </div>
        </div>

        {!showMasked && (
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              <strong>주의:</strong> 개인정보가 마스킹 해제되어 표시됩니다. 
              데이터 보호 규정을 준수하여 사용하세요.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid gap-4">
          {captures.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                아직 리드 캡처가 없습니다.
              </CardContent>
            </Card>
          ) : (
            captures.map((capture) => (
              <Card key={capture.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">
                      Lead #{capture.id.slice(0, 8)}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {capture.source}
                      </Badge>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {new Date(capture.captured_at).toLocaleDateString('ko-KR')}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium mb-2">연락처 정보</h4>
                      {renderContactInfo(capture.contact_info)}
                    </div>
                    <div className="space-y-2">
                      <div>
                        <h4 className="text-sm font-medium">메타데이터</h4>
                        <div className="text-xs text-muted-foreground space-y-1">
                          <div>파트너: {capture.partner_id.slice(0, 8)}...</div>
                          <div>리드 마그넷: {capture.lead_magnet_id.slice(0, 8)}...</div>
                          {capture.ip_address && (
                            <div>IP: {capture.ip_address}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </AdminGuard>
  );
}