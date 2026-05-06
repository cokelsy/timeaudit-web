import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import AppLayout from '@/components/Layout/AppLayout';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import ForgotPasswordPage from '@/pages/ForgotPasswordPage';
import MainPage from '@/pages/MainPage';

const AnalyticsPage = lazy(() => import('@/pages/AnalyticsPage'));

function AnalyticsFallback() {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="text-[13px] text-text-secondary">加载中...</div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route element={<AppLayout />}>
            <Route path="/app" element={<MainPage />} />
            <Route
              path="/analytics"
              element={
                <Suspense fallback={<AnalyticsFallback />}>
                  <AnalyticsPage />
                </Suspense>
              }
            />
          </Route>
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}