import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export type AdminRole = 'SuperAdmin' | 'Ops' | 'Compliance' | 'Finance' | 'Growth' | 'Support' | 'Dev';

interface AdminAuthState {
  isAdmin: boolean;
  roles: AdminRole[];
  loading: boolean;
  hasRole: (role: AdminRole) => boolean;
  hasAnyRole: (roles: AdminRole[]) => boolean;
}

export function useAdminAuth(): AdminAuthState {
  const { user, isAuthenticated } = useAuth();
  const [roles, setRoles] = useState<AdminRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUserRoles() {
      if (!isAuthenticated || !user) {
        setRoles([]);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id);

        if (error) {
          console.error('Error fetching user roles:', error);
          setRoles([]);
        } else {
          setRoles(data?.map(r => r.role as AdminRole) || []);
        }
      } catch (error) {
        console.error('Error fetching user roles:', error);
        setRoles([]);
      } finally {
        setLoading(false);
      }
    }

    fetchUserRoles();
  }, [isAuthenticated, user]);

  const hasRole = (role: AdminRole): boolean => {
    return roles.includes(role);
  };

  const hasAnyRole = (requiredRoles: AdminRole[]): boolean => {
    return requiredRoles.some(role => roles.includes(role));
  };

  return {
    isAdmin: roles.length > 0,
    roles,
    loading,
    hasRole,
    hasAnyRole
  };
}