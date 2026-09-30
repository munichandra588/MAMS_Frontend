import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getExpenditures, createExpenditure, getAssets, getBases } from '../services/api';

export default function Expenditures() {
  const { user, isAdmin, isCommander } = useAuth();
  const [expenditures, setExpenditures] = useState([]);
  const [assets, setAssets] = useState([]);
  const [bases, setBases] = useState([]);
  const [filterBase, setFilterBase] = useState('');
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    asset: { id: '' },
    base: { id: '' },
    quantity: '',
    reason: '',
    expenditureDate: new Date().toISOString().split('T')[0]
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const canAdd = isAdmin() || isCommander();

  useEffect(() => {
    loadBases();
    loadAssets();
  }, []);

  useEffect(() => {
    loadExpenditures();
  }, [filterBase]);

  const loadExpenditures = async () => {
    try {
      const res = await getExpenditures(filterBase || null);
      setExpenditures(res.data);
    } catch (err) {
      setError('Failed to load expenditures');
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
      setError('Please select an asset to expend');
      return;
    }
    if (qty <= 0) {
      setError('Quantity must be greater than zero');
      return;
    }
    if (qty > selectedAsset.quantity) {
      setError(`Cannot expend ${qty} units. Only ${selectedAsset.quantity} units available.`);
      return;
    }

    try {
      const payload = {
        ...form,
        quantity: qty
      };
      await createExpenditure(payload);
      setShowForm(false);
      setSuccess(`Expenditure of ${qty} units recorded successfully!`);
      setForm({
        asset: { id: '' },
        base: { id: '' },
        quantity: '',
        reason: '',
        expenditureDate: new Date().toISOString().split('T')[0]
      });
      loadExpenditures();
      loadAssets();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to record expenditure');
    }
  };

  const filteredExpenditures = [...expenditures]
    .sort((a, b) => (b.id || 0) - (a.id || 0))
    .filter(e => {
      if (!search) return true;
      const term = search.toLowerCase();
      const asset = (e.asset?.assetName || '').toLowerCase();
      const reason = (e.reason || '').toLowerCase();
      const base = (e.base?.baseName || '').toLowerCase();
      return asset.includes(term) || reason.includes(term) || base.includes(term);
    });

  return (
    <div>
      <h2>Asset Expenditures</h2>
      {error && <div className="error-msg">{error}</div>}
      {success && <div className="success-msg">{success}</div>}

      {/* Filter and Action Bar */}
      <div className="filter-bar">
        <input
          type="text"
          placeholder="Search by Asset, Reason, or Base..."
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
            {showForm ? 'Cancel' : '+ Record Expenditure'}
          </button>
        )}
      </div>

      {/* Expenditure Form */}
      {showForm && canAdd && (
        <div className="inline-form" style={{ display: 'block' }}>
          <h3 style={{ marginBottom: '10px' }}>Record Asset Expenditure</h3>
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
              type="number"
              placeholder="Quantity"
              value={form.quantity}
              onChange={e => setForm({ ...form, quantity: e.target.value })}
              required
              min="1"
            />
            <input
              placeholder="Reason"
              value={form.reason}
              onChange={e => setForm({ ...form, reason: e.target.value })}
              required
            />
            <input
              type="date"
              value={form.expenditureDate}
              onChange={e => setForm({ ...form, expenditureDate: e.target.value })}
              required
            />
            <button type="submit" className="btn btn-primary">
              Confirm Expenditure
            </button>
          </form>
        </div>
      )}

      <table>
        <thead>
          <tr>
            <th>Asset</th>
            <th>Base</th>
            <th>Quantity Expended</th>
            <th>Reason</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {filteredExpenditures.map(e => (
            <tr key={e.id}>
              <td><strong>{e.asset?.assetName}</strong> ({e.asset?.assetCode})</td>
              <td>{e.base?.baseName}</td>
              <td>-{e.quantity}</td>
              <td>{e.reason}</td>
              <td>{e.expenditureDate}</td>
            </tr>
          ))}
          {filteredExpenditures.length === 0 && (
            <tr><td colSpan="5" style={{ textAlign: 'center', padding: '15px' }}>No expenditures recorded.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
