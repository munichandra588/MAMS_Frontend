import { useState, useEffect } from 'react';
import { getAuditLogs } from '../services/api';

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      const res = await getAuditLogs();
      setLogs(res.data);
    } catch (err) {
      setError('Failed to load audit logs');
    }
  };

  const filteredLogs = logs.filter(l => {
    if (actionFilter && l.action !== actionFilter) return false;
    if (!search) return true;
    const term = search.toLowerCase();
    const user = (l.user?.fullName || 'system').toLowerCase();
    const action = (l.action || '').toLowerCase();
    const entity = (l.entity || '').toLowerCase();
    const desc = (l.description || '').toLowerCase();
    return user.includes(term) || action.includes(term) || entity.includes(term) || desc.includes(term);
  });

  const actions = Array.from(new Set(logs.map(l => l.action).filter(Boolean)));

  return (
    <div>
      <h2>Audit Logs</h2>
      {error && <div className="error-msg">{error}</div>}

      <div className="filter-bar">
        <input
          type="text"
          placeholder="Search by User, Action, or Description..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select value={actionFilter} onChange={e => setActionFilter(e.target.value)}>
          <option value="">All Actions</option>
          {actions.map(act => <option key={act} value={act}>{act}</option>)}
        </select>
      </div>

      <table>
        <thead>
          <tr>
            <th>Date / Time</th>
            <th>User</th>
            <th>Action</th>
            <th>Entity</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          {filteredLogs.map(l => (
            <tr key={l.id}>
              <td style={{ whiteSpace: 'nowrap' }}>{l.createdAt ? new Date(l.createdAt).toLocaleString() : ''}</td>
              <td><strong>{l.user?.fullName || 'System'}</strong></td>
              <td>
                <span className="status-badge">
                  {l.action}
                </span>
              </td>
              <td>{l.entity}</td>
              <td>{l.description}</td>
            </tr>
          ))}
          {filteredLogs.length === 0 && (
            <tr><td colSpan="5" style={{ textAlign: 'center', padding: '15px' }}>No audit logs found.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
