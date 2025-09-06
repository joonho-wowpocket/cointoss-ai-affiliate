import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

export default function EmailConfirm() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const confirmEmail = async () => {
      try {
        const token_hash = searchParams.get('token_hash');
        const type = searchParams.get('type');
        
        if (!token_hash || type !== 'email') {
          setStatus('error');
          setMessage('유효하지 않은 확인 링크입니다.');
          return;
        }

        const { error } = await supabase.auth.verifyOtp({
          token_hash,
          type: 'email',
        });

        if (error) {
          console.error('Email confirmation error:', error);
          setStatus('error');
          setMessage(error.message || '이메일 확인 중 오류가 발생했습니다.');
        } else {
          setStatus('success');
          setMessage('이메일이 성공적으로 확인되었습니다!');
          
          // 3초 후 대시보드로 리디렉션
          setTimeout(() => {
            navigate('/dashboard');
          }, 3000);
        }
      } catch (err) {
        console.error('Unexpected error:', err);
        setStatus('error');
        setMessage('예상치 못한 오류가 발생했습니다.');
      }
    };

    confirmEmail();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center">
            {status === 'loading' && (
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            )}
            {status === 'success' && (
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            )}
            {status === 'error' && (
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
            )}
          </div>
          
          <CardTitle className="text-2xl">
            {status === 'loading' && '이메일 확인 중...'}
            {status === 'success' && '확인 완료!'}
            {status === 'error' && '확인 실패'}
          </CardTitle>
          
          <CardDescription>
            {status === 'loading' && '잠시만 기다려주세요...'}
            {status === 'success' && '곧 대시보드로 이동합니다'}
            {status === 'error' && '이메일 확인에 문제가 발생했습니다'}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Alert className={status === 'error' ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}>
            <AlertDescription className={status === 'error' ? 'text-red-800' : 'text-green-800'}>
              {message}
            </AlertDescription>
          </Alert>
          
          {status === 'error' && (
            <div className="mt-6 space-y-3">
              <Button 
                className="w-full" 
                onClick={() => navigate('/auth/signup')}
              >
                다시 회원가입하기
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate('/auth/login')}
              >
                로그인하기
              </Button>
            </div>
          )}
          
          {status === 'success' && (
            <div className="mt-6">
              <Button 
                className="w-full" 
                onClick={() => navigate('/dashboard')}
              >
                대시보드로 이동
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}