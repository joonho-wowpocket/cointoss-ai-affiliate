import { ReactNode } from 'react';
import { useAdminAuth, AdminRole } from '@/hooks/useAdminAuth';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Loader2 } from 'lucide-react';

interface AdminGuardProps {
  children: ReactNode;
  roles?: AdminRole[];
  fallback?: ReactNode;
}

export function AdminGuard({ children, roles, fallback }: AdminGuardProps) {
  const { isAdmin, hasAnyRole, loading } = useAdminAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>권한 확인 중...</span>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return fallback || (
      <Card className="max-w-md mx-auto mt-8">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="h-8 w-8 text-muted-foreground" />
            <div>
              <h3 className="text-lg font-semibold">관리자 권한 필요</h3>
              <p className="text-sm text-muted-foreground">
                이 페이지에 접근하려면 관리자 권한이 필요합니다.
              </p>
            </div>
          </div>
          <Alert>
            <AlertDescription>
              관리자 권한이 필요한 경우 시스템 관리자에게 문의하세요.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (roles && !hasAnyRole(roles)) {
    return fallback || (
      <Card className="max-w-md mx-auto mt-8">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="h-8 w-8 text-muted-foreground" />
            <div>
              <h3 className="text-lg font-semibold">권한 부족</h3>
              <p className="text-sm text-muted-foreground">
                이 기능을 사용하려면 특정 권한이 필요합니다.
              </p>
            </div>
          </div>
          <Alert>
            <AlertDescription>
              필요 권한: {roles.join(', ')}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return <>{children}</>;
}