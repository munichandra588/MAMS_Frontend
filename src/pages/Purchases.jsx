import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getPurchases, createPurchase, getAssets, getBases } from '../services/api';

export default function Purchases() {
  const { user, isAdmin, isLogistics, isCommander } = useAuth();
  const [purchases, setPurchases] = useState([]);
  const [assets, setAssets] = useState([]);
  const [bases, setBases] = useState([]);
  const [filterBase, setFilterBase] = useState('');
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    asset: { id: '' },
    base: { id: '' },
    quantity: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    supplier: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const canAdd = isAdmin() || isLogistics() || isCommander();

  useEffect(() => {
    loadBases();
    loadAssets();
  }, []);

  useEffect(() => {
    loadPurchases();
  }, [filterBase]);

  const loadPurchases = async () => {
    try {
      const res = await getPurchases(filterBase || null);
      setPurchases(res.data);
    } catch (err) {
      setError('Failed to load purchases');
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
    try {
      const payload = {
        ...form,
        quantity: parseInt(form.quantity)
      };
      const res = await createPurchase(payload);
      setShowForm(false);
      setSuccess(`Purchase ${res.data.referenceNumber} recorded successfully! Stock increased.`);
      setForm({
        asset: { id: '' },
        base: { id: '' },
        quantity: '',
        purchaseDate: new Date().toISOString().split('T')[0],
        supplier: ''
      });
      loadPurchases();
      loadAssets();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create purchase');
    }
  };

  const filteredPurchases = [...purchases]
    .sort((a, b) => (b.id || 0) - (a.id || 0))
    .filter(p => {
      if (!search) return true;
      const term = search.toLowerCase();
      const ref = (p.referenceNumber || '').toLowerCase();
      const asset = (p.asset?.assetName || '').toLowerCase();
      const sup = (p.supplier || '').toLowerCase();
      const base = (p.base?.baseName || '').toLowerCase();
      return ref.includes(term) || asset.includes(term) || sup.includes(term) || base.includes(term);
    });

  return (
    <div>
      <h2>Purchases & Stock Inflow</h2>
      {error && <div className="error-msg">{error}</div>}
      {success && (
        <div style={{ background: '#d4edda', color: '#155724', padding: '10px 15px', borderRadius: '4px', marginBottom: '15px', border: '1px solid #c3e6cb' }}>
          {success}
        </div>
      )}

      {/* Filter and Action Bar */}
      <div className="filter-bar" style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Search by Reference, Asset, or Supplier..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ minWidth: '240px' }}
        />

        <select value={filterBase} onChange={e => setFilterBase(e.target.value)}>
          <option value="">All Bases</option>
          {bases.map(b => <option key={b.id} value={b.id}>{b.baseName}</option>)}
        </select>

        {canAdd && (
          <button
            className="btn btn-primary"
            onClick={() => setShowForm(!showForm)}
            style={{ background: '#27ae60', marginLeft: 'auto' }}
          >
            {showForm ? 'Cancel Form' : '+ Add Purchase'}
          </button>
        )}
      </div>

      {showForm && canAdd && (
        <div style={{ background: '#fff', border: '1px solid #ddd', borderRadius: '6px', padding: '20px', marginBottom: '20px' }}>
          <h3 style={{ marginBottom: '15px', color: '#2c3e50' }}>Record New Purchase</h3>
          <form className="inline-form" onSubmit={handleSubmit}>
            <select value={form.asset.id} onChange={e => handleAssetSelect(e.target.value)} required>
              <option value="">-- Select Asset --</option>
              {assets.map(a => (
                <option key={a.id} value={a.id}>
                  {a.assetName} ({a.assetCode}) - at {a.base?.baseName} (Stock: {a.quantity})
                </option>
              ))}
            </select>

            <select value={form.base.id} onChange={e => setForm({ ...form, base: { id: e.target.value } })} required>
              <option value="">-- Receiving Base --</option>
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
              type="date"
              value={form.purchaseDate}
              onChange={e => setForm({ ...form, purchaseDate: e.target.value })}
              required
            />
            <input
              placeholder="Supplier (e.g. ABC Supplier)"
              value={form.supplier}
              onChange={e => setForm({ ...form, supplier: e.target.value })}
            />
            <button type="submit" className="btn btn-primary" style={{ background: '#27ae60' }}>
              Save Purchase
            </button>
          </form>
        </div>
      )}

      <table>
        <thead>
          <tr>
            <th>Reference</th>
            <th>Date</th>
            <th>Asset</th>
            <th>Base</th>
            <th>Quantity Added</th>
            <th>Supplier</th>
          </tr>
        </thead>
        <tbody>
          {filteredPurchases.map(p => (
            <tr key={p.id}>
              <td><strong>{p.referenceNumber}</strong></td>
              <td>{p.purchaseDate}</td>
              <td>{p.asset?.assetName} <small style={{ color: '#7f8c8d' }}>({p.asset?.assetCode})</small></td>
              <td>{p.base?.baseName}</td>
              <td><strong>{p.quantity}</strong></td>
              <td>{p.supplier || 'N/A'}</td>
            </tr>
          ))}
          {filteredPurchases.length === 0 && (
            <tr><td colSpan="6" style={{ textAlign: 'center', padding: '20px', color: '#7f8c8d' }}>No purchases found</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
