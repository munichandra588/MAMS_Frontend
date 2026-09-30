import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getBases, createBase, updateBase } from '../services/api';

export default function Bases() {
  const { isAdmin } = useAuth();
  const [bases, setBases] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ baseCode: '', baseName: '', location: '', status: 'ACTIVE' });
  const [error, setError] = useState('');

  useEffect(() => { loadBases(); }, []);

  const loadBases = async () => {
    try {
      const res = await getBases();
      setBases(res.data);
    } catch (err) {
      setError('Failed to load bases');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editing) {
        await updateBase(editing, form);
      } else {
        await createBase(form);
      }
      setShowForm(false);
      setEditing(null);
      setForm({ baseCode: '', baseName: '', location: '', status: 'ACTIVE' });
      loadBases();
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed');
    }
  };

  const startEdit = (base) => {
    setEditing(base.id);
    setForm({ baseCode: base.baseCode, baseName: base.baseName, location: base.location, status: base.status });
    setShowForm(true);
  };

  return (
    <div>
      <h2>Bases</h2>
      {error && <div className="error-msg">{error}</div>}

      {isAdmin() && (
        <div className="filter-bar">
          <button className="btn btn-primary" onClick={() => { setShowForm(!showForm); setEditing(null); setForm({ baseCode: '', baseName: '', location: '', status: 'ACTIVE' }); }}>
            {showForm ? 'Cancel' : 'Add Base'}
          </button>
        </div>
      )}

      {showForm && isAdmin() && (
        <form className="inline-form" onSubmit={handleSubmit}>
          <input placeholder="Base Code" value={form.baseCode} onChange={e => setForm({ ...form, baseCode: e.target.value })} required />
          <input placeholder="Base Name" value={form.baseName} onChange={e => setForm({ ...form, baseName: e.target.value })} required />
          <input placeholder="Location" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
          <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
            <option value="ACTIVE">ACTIVE</option>
            <option value="INACTIVE">INACTIVE</option>
          </select>
          <button type="submit" className="btn btn-primary">{editing ? 'Update' : 'Save'}</button>
        </form>
      )}

      <table>
        <thead>
          <tr>
            <th>Base Code</th>
            <th>Base Name</th>
            <th>Location</th>
            <th>Status</th>
            {isAdmin() && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {bases.map(b => (
            <tr key={b.id}>
              <td>{b.baseCode}</td>
              <td>{b.baseName}</td>
              <td>{b.location}</td>
              <td>{b.status}</td>
              {isAdmin() && (
                <td><button className="btn btn-small" onClick={() => startEdit(b)}>Edit</button></td>
              )}
            </tr>
          ))}
          {bases.length === 0 && <tr><td colSpan="5">No bases found</td></tr>}
        </tbody>
      </table>
    </div>
  );
}
