import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Layout/Header';
import Sidebar from '@/components/Layout/Sidebar';

export default function AppLayout() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-bg-page">
        <div className="text-text-secondary text-sm">加载中...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="h-screen flex flex-col bg-bg-page">
      <Header />
      <div className="flex-1 flex overflow-hidden">
        <main className="flex-1 overflow-auto min-w-0">
          <Outlet />
        </main>
        <Sidebar />
      </div>
    </div>
  );
}