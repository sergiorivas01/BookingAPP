import { useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './Login.css';

function Login() {
  const { isAuthenticated, login, isLoading } = useAuth();

  useEffect(() => {
    // If already authenticated, redirect to dashboard
    if (isAuthenticated) {
      window.location.href = '/dashboard';
    }
  }, [isAuthenticated]);

  const handleLogin = () => {
    login();
  };

  if (isLoading) {
    return (
      <div className="login-container">
        <div className="login-card">
          <div>Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>BookingAPP</h1>
        <p className="login-subtitle">Sign in to continue</p>
        <button 
          onClick={handleLogin} 
          className="login-button"
          disabled={isLoading}
        >
          Sign in with OAuth
        </button>
      </div>
    </div>
  );
}

export default Login;

