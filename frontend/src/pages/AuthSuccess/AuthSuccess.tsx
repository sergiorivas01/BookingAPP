import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './AuthSuccess.css';

function AuthSuccess() {
  const navigate = useNavigate();
  const { checkAuth, isAuthenticated } = useAuth();
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    // Check auth status after OAuth callback
    const verifyAuth = async () => {
      await checkAuth();
      setHasChecked(true);
    };

    verifyAuth();
  }, [checkAuth]);

  useEffect(() => {
    // After checking auth, redirect based on status
    if (hasChecked) {
      if (isAuthenticated) {
        navigate('/dashboard', { replace: true });
      } else {
        // If still not authenticated, redirect to login
        navigate('/login', { replace: true });
      }
    }
  }, [hasChecked, isAuthenticated, navigate]);

  return (
    <div className="auth-success-container">
      <div className="auth-success-card">
        <div className="spinner"></div>
        <h2>Completing sign in...</h2>
        <p>Please wait while we verify your authentication.</p>
      </div>
    </div>
  );
}

export default AuthSuccess;

