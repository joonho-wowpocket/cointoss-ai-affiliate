import { AdminGuard } from '@/components/admin/AdminGuard';
import { AdminDashboard } from '@/components/admin/AdminDashboard';

export default function AdminDashboardPage() {
  return (
    <AdminGuard>
      <div className="container mx-auto px-4 py-8">
        <AdminDashboard />
      </div>
    </AdminGuard>
  );
}