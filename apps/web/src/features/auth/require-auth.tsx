import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { useAuthSession } from './auth-session-context';

export function RequireAuth() {
  const { isAuthenticated } = useAuthSession();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
