export const storage = {
  getSidebarCollapsed: (): boolean => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('sidebar:collapsed') === '1';
  },
  
  setSidebarCollapsed: (collapsed: boolean): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('sidebar:collapsed', collapsed ? '1' : '0');
  },
};