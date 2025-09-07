import { AlertTriangle, Shield } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useRuntime } from '@/contexts/RuntimeContext';

interface PreviewBlockedBannerProps {
  message?: string;
  showAdminOverride?: boolean;
}

export function PreviewBlockedBanner({ 
  message = "Preview data blocked", 
  showAdminOverride = false 
}: PreviewBlockedBannerProps) {
  const { enablePreviewFlag } = useRuntime();

  return (
    <Alert className="border-red-200 bg-red-50 mb-6">
      <AlertTriangle className="h-4 w-4 text-red-600" />
      <AlertTitle className="text-red-800">Data Access Restricted</AlertTitle>
      <AlertDescription className="text-red-700">
        <div className="space-y-3">
          <p>{message}. Only live data from approved integrations is displayed.</p>
          
          {showAdminOverride && (
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => enablePreviewFlag(true)}
                className="border-red-300 text-red-800 hover:bg-red-100"
              >
                <Shield className="w-3 h-3 mr-2" />
                Admin Override
              </Button>
              <span className="text-xs text-red-600">
                Available for SuperAdmin/Dev roles only
              </span>
            </div>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
}

export function EmptyStateCard({ 
  title, 
  description, 
  ctaLabel, 
  ctaAction,
  icon: Icon 
}: {
  title: string;
  description: string;
  ctaLabel?: string;
  ctaAction?: () => void;
  icon?: any;
}) {
  return (
    <div className="text-center py-12 space-y-4">
      {Icon && (
        <div className="mx-auto w-12 h-12 bg-muted/50 rounded-full flex items-center justify-center">
          <Icon className="w-6 h-6 text-muted-foreground" />
        </div>
      )}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-muted-foreground max-w-sm mx-auto">{description}</p>
      </div>
      {ctaLabel && ctaAction && (
        <Button onClick={ctaAction} className="mt-4">
          {ctaLabel}
        </Button>
      )}
    </div>
  );
}