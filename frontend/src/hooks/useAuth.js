import { useContext, useEffect } from 'react';
import { AuthContext } from '../contexts/AuthContext';

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function useAuthInit() {
  const { checkAuth, loading } = useAuth();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return loading;
}
