import { Outlet, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AdminSidebar } from '@/components/AdminSidebar';
import { useState, useEffect } from 'react';
import { getSupplierStats } from '@/api/services/supplierService';
import { apiClient } from '@/lib/apiClient';

export function AdminLayout() {
  const { account } = useAuth();
  const navigate = useNavigate();
  const [supplierStats, setSupplierStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0, verified: 0 });
  const [pendingVehicles, setPendingVehicles] = useState(0);

  const isInternalAccount = account?.role === 'admin' || account?.role === 'sales' || account?.role === 'marketing';
  const isSubscribedUser = account?.role === 'institute' || account?.role === 'vendor' || account?.role === 'teacher';

  useEffect(() => {
    if (isInternalAccount) {
      loadStats();
    }
  }, [isInternalAccount]);

  const loadStats = async () => {
    try {
      const [supplierResponse, pendingResponse] = await Promise.all([
        getSupplierStats(),
        apiClient.get<any[]>('/admin/pending', { requiresAuth: true })
      ]);
      setSupplierStats(supplierResponse.data);
      setPendingVehicles(pendingResponse.length);
    } catch (error) {
      console.error('Failed to load stats');
    }
  };

  if (!account || (!isInternalAccount && !isSubscribedUser)) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p className="text-muted-foreground mb-6">You do not have permission to access this portal</p>
        <Button onClick={() => navigate('/')}>Go to Home</Button>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      <AdminSidebar 
        pendingVehicles={pendingVehicles} 
        pendingSuppliers={supplierStats.pending}
      />
      <main className="flex-1 h-screen overflow-y-auto">
        <div className="p-4 border-b border-border bg-card flex justify-between items-center lg:hidden">
          <Link to="/" className="flex items-center gap-2">
            <img 
              src="https://firebasestorage.googleapis.com/v0/b/blink-451505.firebasestorage.app/o/user-uploads%2FmxwyRYTs2dcnubQCH6xSOA5OSFz2%2Fimage__9a481536.png?alt=media&token=b799bfcc-670d-46cb-9ea9-b9e521be88f2" 
              alt="EduFleet" 
              className="h-8 w-auto"
            />
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium px-2 py-1 bg-primary/10 text-primary rounded-full uppercase">
              {account.role}
            </span>
          </div>
        </div>
        <Outlet />
      </main>
    </div>
  );
}