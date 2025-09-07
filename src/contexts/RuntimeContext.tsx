import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { useAdminAuth } from '@/hooks/useAdminAuth';

type RuntimeMode = 'preview' | 'staging' | 'production';

interface RuntimeContextType {
  runtime: RuntimeMode;
  allowPreviewData: boolean;
  isPreviewBlocked: boolean;
  setRuntime: (mode: RuntimeMode) => void;
  enablePreviewFlag: (enabled: boolean) => void;
  clearPreviewState: () => void;
}

const RuntimeContext = createContext<RuntimeContextType | undefined>(undefined);

const PREVIEW_FLAG_KEY = 'app.flags.allowPreviewData';
const RUNTIME_MODE_KEY = 'app.env.runtime';

export function RuntimeProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const { isAdmin, hasAnyRole } = useAdminAuth();
  
  // Initialize runtime mode based on environment
  const getInitialRuntime = (): RuntimeMode => {
    const stored = localStorage.getItem(RUNTIME_MODE_KEY);
    if (stored && ['preview', 'staging', 'production'].includes(stored)) {
      return stored as RuntimeMode;
    }
    return process.env.NODE_ENV === 'production' ? 'production' : 'staging';
  };

  const [runtime, setRuntimeState] = useState<RuntimeMode>(getInitialRuntime());
  const [previewFlag, setPreviewFlag] = useState<boolean>(() => {
    return localStorage.getItem(PREVIEW_FLAG_KEY) === 'true';
  });

  // Determine if preview data should be allowed
  const allowPreviewData = (() => {
    // In production, never allow preview data except for SuperAdmin/Dev
    if (runtime === 'production') {
      return isAdmin || hasAnyRole(['SuperAdmin', 'Dev']);
    }
    
    // In staging/preview, allow if user is admin and flag is enabled
    if (runtime === 'staging' || runtime === 'preview') {
      return (isAdmin || hasAnyRole(['SuperAdmin', 'Dev'])) && previewFlag;
    }
    
    return false;
  })();

  // Block preview data for regular users
  const isPreviewBlocked = isAuthenticated && !allowPreviewData;

  // Force production mode for regular users on login
  useEffect(() => {
    if (isAuthenticated && user) {
      // Check if user is regular user/partner (not admin)
      if (!isAdmin && !hasAnyRole(['SuperAdmin', 'Dev'])) {
        setRuntimeState('production');
        localStorage.setItem(RUNTIME_MODE_KEY, 'production');
        clearPreviewState();
      }
    }
  }, [isAuthenticated, user, isAdmin, hasAnyRole]);

  const setRuntime = (mode: RuntimeMode) => {
    // Only allow admin users to change runtime mode
    if (isAdmin || hasAnyRole(['SuperAdmin', 'Dev'])) {
      setRuntimeState(mode);
      localStorage.setItem(RUNTIME_MODE_KEY, mode);
      
      // Clear preview state when switching to production
      if (mode === 'production') {
        clearPreviewState();
      }
    }
  };

  const enablePreviewFlag = (enabled: boolean) => {
    // Only allow admin users to enable preview flag
    if (isAdmin || hasAnyRole(['SuperAdmin', 'Dev'])) {
      setPreviewFlag(enabled);
      localStorage.setItem(PREVIEW_FLAG_KEY, enabled.toString());
    }
  };

  const clearPreviewState = () => {
    // Clear any preview-related data from storage
    const keysToRemove = [
      'dashboard.previewKPI',
      'partner.previewHub',
      'earnings.previewData',
      'marketplace.previewProducts',
      'profile.previewData'
    ];
    
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });
    
    console.log('Preview state cleared');
  };

  const value = {
    runtime,
    allowPreviewData,
    isPreviewBlocked,
    setRuntime,
    enablePreviewFlag,
    clearPreviewState
  };

  return (
    <RuntimeContext.Provider value={value}>
      {children}
    </RuntimeContext.Provider>
  );
}

export function useRuntime() {
  const context = useContext(RuntimeContext);
  if (context === undefined) {
    throw new Error('useRuntime must be used within a RuntimeProvider');
  }
  return context;
}