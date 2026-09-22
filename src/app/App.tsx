import { useCallback, useState } from 'react';

// features
import { LoginScreen } from '@/features/auth';
import { ClientCabinetScreen } from '@/features/profile';

export default function App() {
  const [isClientLoggedIn, setIsClientLoggedIn] = useState(false);

  const handleLoginSuccess = useCallback(() => {
    setIsClientLoggedIn(true);
  }, []);

  const handleLogout = useCallback(() => {
    setIsClientLoggedIn(false);
  }, []);

  if (!isClientLoggedIn) {
    return <LoginScreen onSuccess={handleLoginSuccess} />;
  }

  return <ClientCabinetScreen onLogout={handleLogout} />;
}
