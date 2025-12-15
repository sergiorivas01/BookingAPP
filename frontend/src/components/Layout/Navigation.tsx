import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Navigation.css';

function Navigation() {
  const location = useLocation();
  const { isAuthenticated, user, login, logout, isLoading } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  return (
    <nav className="navigation">
      <div className="nav-container">
        <Link to="/dashboard" className="nav-brand">
          <h1>BookingAPP</h1>
        </Link>
        <div className="nav-right">
          {isAuthenticated && (
            <ul className="nav-links">
              <li>
                <Link
                  to="/dashboard"
                  className={isActive('/dashboard') ? 'active' : ''}
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  to="/clients"
                  className={isActive('/clients') ? 'active' : ''}
                >
                  Clients
                </Link>
              </li>
              <li>
                <Link
                  to="/reservations"
                  className={isActive('/reservations') ? 'active' : ''}
                >
                  Reservations
                </Link>
              </li>
              <li>
                <Link
                  to="/properties"
                  className={isActive('/properties') ? 'active' : ''}
                >
                  Properties
                </Link>
              </li>
            </ul>
          )}
          <div className="nav-auth">
            {!isLoading && (
              <>
                {isAuthenticated && user ? (
                  <div className="user-menu">
                    <div className="user-info">
                      {user.picture && (
                        <img 
                          src={user.picture} 
                          alt={user.name} 
                          className="user-avatar"
                        />
                      )}
                      <span className="user-name">{user.name}</span>
                    </div>
                    <button onClick={handleLogout} className="logout-button">
                      Logout
                    </button>
                  </div>
                ) : (
                  <button onClick={login} className="login-button-nav">
                    Login
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navigation;

