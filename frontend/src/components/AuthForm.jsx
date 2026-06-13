import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function AuthForm({ mode, onSubmit, error }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const isLogin = mode === 'login';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!isLogin && !name.trim()) {
      setFormError('Name is required');
      return;
    }
    if (!email.trim()) {
      setFormError('Email is required');
      return;
    }
    if (password.length < 6) {
      setFormError('Password must be at least 6 characters');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(isLogin ? { email, password } : { name, email, password });
    } catch (err) {
      setFormError(err.response?.data?.message || err.message || 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md animate-fade-in">
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-2xl nexus-gradient flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-500/20">
          <span className="text-white text-2xl font-bold">N</span>
        </div>
        <h1 className="text-2xl font-bold text-white mb-1">
          {isLogin ? 'Welcome back' : 'Join NEXUS'}
        </h1>
        <p className="text-cosmic-muted text-sm">
          {isLogin
            ? 'Sign in to your account to continue'
            : 'Create your account and start your journey'}
        </p>
      </div>

      <div className="glass-panel rounded-2xl p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-cosmic-muted mb-1.5">
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full cosmic-input rounded-xl px-4 py-2.5 text-sm"
                placeholder="Your name"
                autoComplete="name"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-cosmic-muted mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full cosmic-input rounded-xl px-4 py-2.5 text-sm"
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-cosmic-muted mb-1.5">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full cosmic-input rounded-xl px-4 py-2.5 text-sm"
              placeholder="At least 6 characters"
              autoComplete={isLogin ? 'current-password' : 'new-password'}
            />
          </div>

          {(formError || error) && (
            <p className="text-red-400 text-sm">{formError || error}</p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full btn-primary rounded-xl py-2.5 text-sm font-medium flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                {isLogin ? 'Signing in...' : 'Creating account...'}
              </>
            ) : (
              isLogin ? 'Sign In' : 'Create Account'
            )}
          </button>
        </form>

        <p className="text-center text-sm text-cosmic-muted mt-6">
          {isLogin ? (
            <>
              Don&apos;t have an account?{' '}
              <Link to="/register" className="text-purple-400 hover:text-purple-300 font-medium">
                Create one
              </Link>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <Link to="/login" className="text-purple-400 hover:text-purple-300 font-medium">
                Sign in
              </Link>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
