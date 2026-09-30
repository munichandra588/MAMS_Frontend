import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAssignments, createAssignment, getAssets, getBases } from '../services/api';

export default function Assignments() {
  const { user, isAdmin, isCommander } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [assets, setAssets] = useState([]);
  const [bases, setBases] = useState([]);
  const [filterBase, setFilterBase] = useState('');
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    asset: { id: '' },
    base: { id: '' },
    personnelName: '',
    quantity: '',
    assignmentDate: new Date().toISOString().split('T')[0],
    status: 'ACTIVE'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const canAdd = isAdmin() || isCommander();

  useEffect(() => {
    loadBases();
    loadAssets();
  }, []);

  useEffect(() => {
    loadAssignments();
  }, [filterBase]);

  const loadAssignments = async () => {
    try {
      const res = await getAssignments(filterBase || null);
      setAssignments(res.data);
    } catch (err) {
      setError('Failed to load assignments');
    }
  };

  const loadAssets = async () => {
    try {
      const res = await getAssets();
      setAssets(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadBases = async () => {
    try {
      const res = await getBases();
      setBases(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAssetSelect = (assetId) => {
    const selected = assets.find(a => a.id === parseInt(assetId));
    setForm(prev => ({
      ...prev,
      asset: { id: assetId },
      base: selected?.base?.id ? { id: String(selected.base.id) } : prev.base
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const selectedAsset = assets.find(a => a.id === parseInt(form.asset.id));
    const qty = parseInt(form.quantity);

    if (!selectedAsset) {
      setError('Please select an asset');
      return;
    }
    if (qty <= 0) {
      setError('Quantity must be greater than zero');
      return;
    }
    if (qty > selectedAsset.quantity) {
      setError(`Cannot assign ${qty} units. Only ${selectedAsset.quantity} units available.`);
      return;
    }

    try {
      const payload = {
        ...form,
        quantity: qty
      };
      await createAssignment(payload);
      setShowForm(false);
      setSuccess(`Asset assigned to ${form.personnelName} successfully!`);
      setForm({
        asset: { id: '' },
        base: { id: '' },
        personnelName: '',
        quantity: '',
        assignmentDate: new Date().toISOString().split('T')[0],
        status: 'ACTIVE'
      });
      loadAssignments();
      loadAssets();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create assignment');
    }
  };

  const filteredAssignments = [...assignments]
    .sort((a, b) => (b.id || 0) - (a.id || 0))
    .filter(a => {
      if (!search) return true;
      const term = search.toLowerCase();
      const asset = (a.asset?.assetName || '').toLowerCase();
      const person = (a.personnelName || '').toLowerCase();
      const base = (a.base?.baseName || '').toLowerCase();
      return asset.includes(term) || person.includes(term) || base.includes(term);
    });

  return (
    <div>
      <h2>Personnel Asset Assignments</h2>
      {error && <div className="error-msg">{error}</div>}
      {success && <div className="success-msg">{success}</div>}

      {/* Filter and Action Bar */}
      <div className="filter-bar">
        <input
          type="text"
          placeholder="Search by Personnel or Asset..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        <select value={filterBase} onChange={e => setFilterBase(e.target.value)}>
          <option value="">All Bases</option>
          {bases.map(b => <option key={b.id} value={b.id}>{b.baseName}</option>)}
        </select>

        {canAdd && (
          <button
            className="btn btn-primary"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? 'Cancel' : '+ Assign Asset'}
          </button>
        )}
      </div>

      {/* Assignment Form */}
      {showForm && canAdd && (
        <div className="inline-form" style={{ display: 'block' }}>
          <h3 style={{ marginBottom: '10px' }}>Issue Asset to Personnel</h3>
          <form className="inline-form" onSubmit={handleSubmit} style={{ margin: 0, padding: 0, border: 'none', background: 'transparent' }}>
            <select value={form.asset.id} onChange={e => handleAssetSelect(e.target.value)} required>
              <option value="">-- Select Asset --</option>
              {assets.map(a => (
                <option key={a.id} value={a.id}>
                  {a.assetName} ({a.assetCode}) - at {a.base?.baseName} (Available: {a.quantity})
                </option>
              ))}
            </select>

            <select value={form.base.id} onChange={e => setForm({ ...form, base: { id: e.target.value } })} required>
              <option value="">-- Base --</option>
              {bases.map(b => <option key={b.id} value={b.id}>{b.baseName}</option>)}
            </select>

            <input
              placeholder="Personnel Name"
              value={form.personnelName}
              onChange={e => setForm({ ...form, personnelName: e.target.value })}
              required
            />
            <input
              type="number"
              placeholder="Quantity"
              value={form.quantity}
              onChange={e => setForm({ ...form, quantity: e.target.value })}
              required
              min="1"
            />
            <input
              type="date"
              value={form.assignmentDate}
              onChange={e => setForm({ ...form, assignmentDate: e.target.value })}
              required
            />
            <button type="submit" className="btn btn-primary">Save Assignment</button>
          </form>
        </div>
      )}

      <table>
        <thead>
          <tr>
            <th>Asset</th>
            <th>Base</th>
            <th>Personnel</th>
            <th>Quantity</th>
            <th>Date</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {filteredAssignments.map(a => (
            <tr key={a.id}>
              <td><strong>{a.asset?.assetName}</strong> ({a.asset?.assetCode})</td>
              <td>{a.base?.baseName}</td>
              <td><strong>{a.personnelName}</strong></td>
              <td>{a.quantity}</td>
              <td>{a.assignmentDate}</td>
              <td>
                <span className={`status-badge status-${(a.status || 'available').toLowerCase()}`}>
                  {a.status}
                </span>
              </td>
            </tr>
          ))}
          {filteredAssignments.length === 0 && (
            <tr><td colSpan="6" style={{ textAlign: 'center', padding: '15px' }}>No assignments found.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
