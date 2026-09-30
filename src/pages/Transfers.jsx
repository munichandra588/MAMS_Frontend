import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getTransfers, createTransfer, getAssets, getBases } from '../services/api';

export default function Transfers() {
  const { user, isAdmin, isLogistics, isCommander } = useAuth();
  const [transfers, setTransfers] = useState([]);
  const [assets, setAssets] = useState([]);
  const [bases, setBases] = useState([]);

  // Filters & Search
  const [filterBase, setFilterBase] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Form State
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    assetId: '',
    fromBaseId: '',
    toBaseId: '',
    quantity: '',
    transferDate: new Date().toISOString().split('T')[0],
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const canCreate = isAdmin() || isLogistics() || isCommander();

  useEffect(() => {
    loadBases();
    loadAssets();
  }, []);

  useEffect(() => {
    loadTransfers();
  }, [filterBase]);

  const loadTransfers = async () => {
    try {
      const res = await getTransfers(filterBase || null);
      setTransfers(res.data);
    } catch (err) {
      setError('Failed to load transfers');
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

  const handleFromBaseChange = (baseId) => {
    setForm(prev => {
      const currentAsset = assets.find(a => a.id === parseInt(prev.assetId));
      const assetStillValid = currentAsset && String(currentAsset.base?.id) === baseId;
      return {
        ...prev,
        fromBaseId: baseId,
        assetId: assetStillValid ? prev.assetId : '',
        toBaseId: prev.toBaseId === baseId ? '' : prev.toBaseId,
      };
    });
  };

  const handleAssetChange = (assetId) => {
    const selected = assets.find(a => a.id === parseInt(assetId));
    setForm(prev => ({
      ...prev,
      assetId,
      fromBaseId: selected?.base?.id ? String(selected.base.id) : prev.fromBaseId,
      toBaseId: prev.toBaseId === String(selected?.base?.id) ? '' : prev.toBaseId,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.fromBaseId || !form.toBaseId) {
      setError('Please select both source and destination bases');
      return;
    }
    if (form.fromBaseId === form.toBaseId) {
      setError('Source and destination bases cannot be the same');
      return;
    }

    const selectedAsset = assets.find(a => a.id === parseInt(form.assetId));
    const qty = parseInt(form.quantity);

    if (!selectedAsset) {
      setError('Please select an asset to transfer');
      return;
    }
    if (qty <= 0) {
      setError('Transfer quantity must be greater than zero');
      return;
    }
    if (qty > selectedAsset.quantity) {
      setError(`Cannot transfer ${qty} units. Only ${selectedAsset.quantity} units available at ${selectedAsset.base?.baseName}`);
      return;
    }

    setLoading(true);
    try {
      const payload = {
        asset: { id: parseInt(form.assetId) },
        fromBase: { id: parseInt(form.fromBaseId) },
        toBase: { id: parseInt(form.toBaseId) },
        quantity: qty,
        transferDate: form.transferDate,
        status: 'COMPLETED',
      };

      const res = await createTransfer(payload);
      setSuccess(`Transfer ${res.data.referenceNumber} completed successfully! ${qty} units transferred to destination base.`);
      setShowForm(false);
      setForm({
        assetId: '',
        fromBaseId: '',
        toBaseId: '',
        quantity: '',
        transferDate: new Date().toISOString().split('T')[0],
      });

      loadTransfers();
      loadAssets();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create transfer');
    } finally {
      setLoading(false);
    }
  };

  const availableSourceAssets = assets.filter(a => {
    if (!form.fromBaseId) return a.quantity > 0;
    return String(a.base?.id) === form.fromBaseId && a.quantity > 0;
  });

  const selectedAssetDetails = assets.find(a => a.id === parseInt(form.assetId));

  const displayedTransfers = transfers
    .filter(t => {
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const ref = (t.referenceNumber || '').toLowerCase();
        const assetName = (t.asset?.assetName || '').toLowerCase();
        const assetCode = (t.asset?.assetCode || '').toLowerCase();
        const fromName = (t.fromBase?.baseName || '').toLowerCase();
        const toName = (t.toBase?.baseName || '').toLowerCase();
        return ref.includes(term) || assetName.includes(term) || assetCode.includes(term) || fromName.includes(term) || toName.includes(term);
      }
      return true;
    })
    .sort((a, b) => (b.id || 0) - (a.id || 0));

  const totalCount = transfers.length;
  const totalUnitsTransferred = transfers
    .reduce((sum, t) => sum + (t.quantity || 0), 0);

  return (
    <div>
      <h2>Inter-Base Transfers</h2>

      {error && <div className="error-msg">{error}</div>}
      {success && <div style={{ background: '#d4edda', color: '#155724', padding: '10px 15px', borderRadius: '4px', marginBottom: '15px', border: '1px solid #c3e6cb' }}>{success}</div>}

      {/* Summary Cards */}
      <div className="dashboard-cards" style={{ marginBottom: '20px' }}>
        <div className="card" style={{ borderLeft: '4px solid #2980b9' }}>
          <div className="card-title">Total Transfers</div>
          <div className="card-value" style={{ color: '#2980b9' }}>{totalCount}</div>
        </div>
        <div className="card" style={{ borderLeft: '4px solid #27ae60' }}>
          <div className="card-title">Total Units Moved</div>
          <div className="card-value" style={{ color: '#27ae60' }}>{totalUnitsTransferred}</div>
        </div>
      </div>

      {/* Filter and Action Bar */}
      <div className="filter-bar" style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '15px' }}>
        <input
          type="text"
          placeholder="Search by Reference, Asset, or Base..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          style={{ minWidth: '240px' }}
        />

        <select value={filterBase} onChange={e => setFilterBase(e.target.value)}>
          <option value="">All Bases</option>
          {bases.map(b => (
            <option key={b.id} value={b.id}>{b.baseName}</option>
          ))}
        </select>

        {canCreate && (
          <button
            className="btn btn-primary"
            onClick={() => setShowForm(!showForm)}
            style={{ marginLeft: 'auto' }}
          >
            {showForm ? 'Cancel Form' : '+ New Transfer'}
          </button>
        )}
      </div>

      {/* Create Transfer Form */}
      {showForm && canCreate && (
        <div style={{ background: '#fff', border: '1px solid #ddd', borderRadius: '6px', padding: '20px', marginBottom: '20px' }}>
          <h3 style={{ marginBottom: '15px', color: '#2c3e50' }}>Initiate Inter-Base Transfer</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '15px', marginBottom: '15px' }}>

              {/* From Base */}
              <div className="form-group" style={{ margin: 0 }}>
                <label>Source Base (From):</label>
                <select
                  value={form.fromBaseId}
                  onChange={e => handleFromBaseChange(e.target.value)}
                  required
                >
                  <option value="">-- Select Source Base --</option>
                  {bases.map(b => (
                    <option key={b.id} value={b.id}>{b.baseName} ({b.baseCode})</option>
                  ))}
                </select>
              </div>

              {/* Asset */}
              <div className="form-group" style={{ margin: 0 }}>
                <label>Select Asset:</label>
                <select
                  value={form.assetId}
                  onChange={e => handleAssetChange(e.target.value)}
                  required
                >
                  <option value="">-- Choose Asset --</option>
                  {availableSourceAssets.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.assetName} ({a.assetCode}) - In Stock: {a.quantity}
                    </option>
                  ))}
                </select>
                {selectedAssetDetails && (
                  <small style={{ color: '#27ae60', display: 'block', marginTop: '4px' }}>
                    Available stock at {selectedAssetDetails.base?.baseName}: <strong>{selectedAssetDetails.quantity}</strong>
                  </small>
                )}
              </div>

              {/* To Base */}
              <div className="form-group" style={{ margin: 0 }}>
                <label>Destination Base (To):</label>
                <select
                  value={form.toBaseId}
                  onChange={e => setForm({ ...form, toBaseId: e.target.value })}
                  required
                >
                  <option value="">-- Select Destination Base --</option>
                  {bases
                    .filter(b => String(b.id) !== form.fromBaseId)
                    .map(b => (
                      <option key={b.id} value={b.id}>{b.baseName} ({b.baseCode})</option>
                    ))}
                </select>
              </div>

              {/* Quantity */}
              <div className="form-group" style={{ margin: 0 }}>
                <label>Transfer Quantity:</label>
                <input
                  type="number"
                  placeholder="e.g. 5"
                  value={form.quantity}
                  onChange={e => setForm({ ...form, quantity: e.target.value })}
                  min="1"
                  max={selectedAssetDetails ? selectedAssetDetails.quantity : undefined}
                  required
                />
              </div>

              {/* Date */}
              <div className="form-group" style={{ margin: 0 }}>
                <label>Transfer Date:</label>
                <input
                  type="date"
                  value={form.transferDate}
                  onChange={e => setForm({ ...form, transferDate: e.target.value })}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Processing...' : 'Execute Transfer Now'}
              </button>
              <button type="button" className="btn" onClick={() => setShowForm(false)} style={{ background: '#bdc3c7', color: '#333' }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Transfers Table */}
      <table>
        <thead>
          <tr>
            <th>Reference</th>
            <th>Date</th>
            <th>Asset</th>
            <th>From Base</th>
            <th>To Base</th>
            <th>Quantity</th>
          </tr>
        </thead>
        <tbody>
          {displayedTransfers.map(t => (
            <tr key={t.id}>
              <td><strong>{t.referenceNumber}</strong></td>
              <td>{t.transferDate}</td>
              <td>
                {t.asset?.assetName} <small style={{ color: '#7f8c8d' }}>({t.asset?.assetCode})</small>
              </td>
              <td>{t.fromBase?.baseName}</td>
              <td>{t.toBase?.baseName}</td>
              <td><strong>{t.quantity}</strong></td>
            </tr>
          ))}
          {displayedTransfers.length === 0 && (
            <tr>
              <td colSpan={6} style={{ textAlign: 'center', padding: '20px', color: '#7f8c8d' }}>
                No transfers found matching your filters.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
