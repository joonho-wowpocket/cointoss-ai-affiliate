import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Eye, Sparkles, ArrowRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface GuestBannerProps {
  onLoginClick: () => void;
  className?: string;
}

export function GuestBanner({ onLoginClick, className = "" }: GuestBannerProps) {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) return null;

  return (
    <div className={`w-full mb-6 flex justify-center px-6 ${className}`}>
      <Alert className="border-primary/30 bg-gradient-to-r from-primary/10 to-transparent py-3 max-w-4xl w-full">
        <Eye className="h-4 w-4 text-primary" />
        <AlertDescription className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm">미리보기 모드</span>
            <span className="text-xs text-muted-foreground">
              • 모든 기능을 체험해보려면 무료 가입하세요
            </span>
          </div>
          <Button 
            onClick={onLoginClick}
            size="sm"
            className="ml-4 flex items-center gap-1 h-7 px-3 text-xs"
          >
            <Sparkles className="w-3 h-3" />
            무료 시작하기
            <ArrowRight className="w-3 h-3" />
          </Button>
        </AlertDescription>
      </Alert>
    </div>
  );
}