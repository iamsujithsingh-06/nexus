import { useNavigate } from 'react-router-dom';
import AuthForm from '../components/AuthForm';
import { useAuth } from '../hooks/useAuth';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async ({ email, password }) => {
    await login(email, password);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-cosmic-bg flex items-center justify-center p-4">
      <AuthForm mode="login" onSubmit={handleLogin} />
    </div>
  );
}
