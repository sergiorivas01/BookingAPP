import { Link, useLocation } from 'react-router-dom';
import './Navigation.css';

function Navigation() {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="navigation">
      <div className="nav-container">
        <Link to="/dashboard" className="nav-brand">
          <h1>BookingAPP</h1>
        </Link>
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
      </div>
    </nav>
  );
}

export default Navigation;

