import { ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Lock, UserPlus, ArrowRight } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

interface AuthGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
  message?: string;
}

export function AuthGuard({ children, fallback, message }: AuthGuardProps) {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="max-w-md mx-auto mt-8">
        <Card>
          <CardHeader className="text-center">
            <div className="w-12 h-12 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
              <Lock className="w-6 h-6 text-primary" />
            </div>
            <CardTitle>로그인이 필요합니다</CardTitle>
            <CardDescription>
              {message || '이 기능을 사용하려면 먼저 로그인해주세요.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertDescription>
                무료 계정을 만들어 모든 기능을 이용해보세요!
              </AlertDescription>
            </Alert>
            
            <div className="space-y-2">
              <Button 
                className="w-full" 
                onClick={() => navigate(`/auth/signup?next=${encodeURIComponent(location.pathname)}`)}
              >
                <UserPlus className="w-4 h-4 mr-2" />
                무료 회원가입
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate(`/auth/login?next=${encodeURIComponent(location.pathname)}`)}
              >
                이미 계정이 있나요? 로그인
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}