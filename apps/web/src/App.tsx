import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '@/app/(auth)/login/page';
import RegisterPage from '@/app/(auth)/register/page';
import { ProtectedRoute } from '@/domains/auth/components';
import { PageLayout } from '@/components/layout';

// 임시 대시보드 컴포넌트 (추후 실제 페이지로 교체)
function DashboardPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <h1 className="text-2xl font-bold">대시보드</h1>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PageLayout />}>
          {/* 공개 라우트 */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* 인증 필요 라우트 */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />

          {/* 기본 리다이렉트 */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
