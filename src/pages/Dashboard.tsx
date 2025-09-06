import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AuthGuard } from '@/components/AuthGuard';

export default function Dashboard() {
  const { user, signOut } = useAuth();

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>거래소 관리</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <AuthGuard>
              <div>
                <p className="text-sm text-muted-foreground">환영합니다!</p>
                <p className="text-lg font-medium">{user?.email}</p>
              </div>
              
              <div className="pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => signOut()}
                >
                  로그아웃
                </Button>
              </div>
            </AuthGuard>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}