import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-nexus-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <img src="/GAMING NEXUS.jpg" alt="NEXUS" className="w-16 h-16 object-contain animate-pulse" />
          <div className="w-6 h-6 border-2 border-nexus-accent/40 border-t-nexus-accent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
