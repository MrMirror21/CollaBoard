import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuthStore } from '@/domains/auth/store/useAuthStore';

interface ProtectedRouteProps {
  children: ReactNode;
}

/**
 * 인증된 사용자만 접근 가능한 라우트 가드 컴포넌트
 * - 미인증 시 로그인 페이지로 리다이렉트
 * - 원래 접근하려던 경로를 state로 전달하여 로그인 후 복귀 가능
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, accessToken, refreshToken } = useAuthStore();
  const location = useLocation();

  const isAuthenticated =
    user !== null && accessToken !== null && refreshToken !== null;

  if (!isAuthenticated) {
    // 로그인 후 원래 접근하려던 페이지로 복귀할 수 있도록 현재 경로를 state로 전달
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return <>{children}</>;
}
