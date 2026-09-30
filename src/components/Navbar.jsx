import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <h2>M.A.M.S.</h2>
        <span className="navbar-subtitle">Military Asset Management System</span>
      </div>
      <div className="navbar-right">
        {user && (
          <button className="btn btn-logout" onClick={handleLogout}>Logout</button>
        )}
      </div>
    </nav>
  );
}
