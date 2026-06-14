import { useNavigate } from 'react-router-dom';
import AuthForm from '../components/AuthForm';
import { useAuth } from '../hooks/useAuth';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async ({ name, email, password }) => {
    await register(name, email, password);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-nexus-bg flex items-center justify-center p-4">
      <AuthForm mode="register" onSubmit={handleRegister} />
    </div>
  );
}
