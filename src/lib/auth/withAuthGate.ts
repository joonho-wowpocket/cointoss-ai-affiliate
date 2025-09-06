import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export interface AuthGateOptions {
  redirectTo?: string;
  message?: string;
}

export function useAuthGate() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  const guardLink = (href: string, options: AuthGateOptions = {}) => {
    if (!isAuthenticated) {
      const redirectTo = options.redirectTo || '/auth/signup';
      const nextUrl = encodeURIComponent(href);
      navigate(`${redirectTo}?next=${nextUrl}`);
      return false;
    }
    return true;
  };
  
  const guardAction = (action: () => void, options: AuthGateOptions = {}) => {
    if (!isAuthenticated) {
      const redirectTo = options.redirectTo || '/auth/signup';
      navigate(redirectTo);
      return false;
    }
    action();
    return true;
  };
  
  return {
    isAuthenticated,
    guardLink,
    guardAction
  };
}