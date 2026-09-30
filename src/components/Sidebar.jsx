import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
  const { isAdmin, isCommander, isLogistics } = useAuth();

  return (
    <div className="sidebar">
      <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}>
        Dashboard
      </NavLink>
      <NavLink to="/assets" className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}>
        Assets
      </NavLink>
      <NavLink to="/purchases" className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}>
        Purchases
      </NavLink>
      <NavLink to="/transfers" className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}>
        Transfers
      </NavLink>
      {(isAdmin() || isCommander()) && (
        <NavLink to="/assignments" className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}>
          Assignments
        </NavLink>
      )}
      {(isAdmin() || isCommander()) && (
        <NavLink to="/expenditures" className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}>
          Expenditures
        </NavLink>
      )}
      {isAdmin() && (
        <NavLink to="/bases" className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}>
          Bases
        </NavLink>
      )}
      {isAdmin() && (
        <NavLink to="/audit-logs" className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}>
          Audit Logs
        </NavLink>
      )}
    </div>
  );
}
