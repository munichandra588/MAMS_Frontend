import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAssets, createAsset, updateAsset, getBases, getCategories } from '../services/api';

export default function Assets() {
  const { user, isAdmin, isLogistics, isCommander } = useAuth();
  const canManage = isAdmin() || isCommander();

  const [assets, setAssets] = useState([]);
  const [bases, setBases] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filterBase, setFilterBase] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ assetCode: '', assetName: '', quantity: 0, status: 'AVAILABLE', category: { id: '' }, base: { id: '' } });
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    loadBases();
    loadCategories();
  }, []);

  useEffect(() => {
    loadAssets();
  }, [filterBase, filterCategory]);

  const loadAssets = async () => {
    try {
      const res = await getAssets(filterBase || null, filterCategory || null);
      setAssets(res.data);
    } catch (err) {
      setError('Failed to load assets');
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

  const loadCategories = async () => {
    try {
      const res = await getCategories();
      setCategories(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    try {
      if (editing) {
        await updateAsset(editing, form);
        setSuccessMsg(`Asset ${form.assetName} updated successfully!`);
      } else {
        await createAsset(form);
        setSuccessMsg(`Asset ${form.assetName} (${form.assetCode}) added successfully!`);
      }
      setShowForm(false);
      setEditing(null);
      setForm({ assetCode: '', assetName: '', quantity: 0, status: 'AVAILABLE', category: { id: '' }, base: { id: '' } });
      loadAssets();
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed');
    }
  };

  const startEdit = (asset) => {
    setEditing(asset.id);
    setForm({
      assetCode: asset.assetCode,
      assetName: asset.assetName,
      quantity: asset.quantity,
      status: asset.status,
      category: { id: asset.category.id },
      base: { id: asset.base.id }
    });
    setShowForm(true);
  };

  const filtered = [...assets]
    .sort((a, b) => (a.id || 0) - (b.id || 0))
    .filter(a =>
      a.assetName.toLowerCase().includes(search.toLowerCase()) ||
      a.assetCode.toLowerCase().includes(search.toLowerCase()) ||
      String(a.id).includes(search)
    );

  return (
    <div>
      <h2>Military Assets Inventory</h2>

      {error && <div className="error-msg">{error}</div>}
      {successMsg && (
        <div style={{ background: '#d4edda', color: '#155724', padding: '10px 15px', borderRadius: '4px', marginBottom: '15px', border: '1px solid #c3e6cb' }}>
          {successMsg}
        </div>
      )}

      {/* Filter and Action Bar */}
      <div className="filter-bar">
        <input
          type="text"
          placeholder="Search by ID, name, or code..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        <select value={filterBase} onChange={e => setFilterBase(e.target.value)}>
          <option value="">All Bases</option>
          {bases.map(b => <option key={b.id} value={b.id}>{b.baseName}</option>)}
        </select>

        <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
          <option value="">All Categories</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>

        {canManage && (
          <button
            className="btn btn-primary"
            onClick={() => {
              setShowForm(!showForm);
              setEditing(null);
              setForm({ assetCode: '', assetName: '', quantity: 0, status: 'AVAILABLE', category: { id: '' }, base: { id: '' } });
            }}
          >
            {showForm ? 'Cancel' : '+ Add Asset'}
          </button>
        )}
      </div>

      {/* Add / Edit Asset Form */}
      {showForm && canManage && (
        <form className="inline-form" onSubmit={handleSubmit} style={{ background: '#fff', padding: '15px', border: '1px solid #ddd', borderRadius: '4px', marginBottom: '15px' }}>
          <input placeholder="Asset Code" value={form.assetCode} onChange={e => setForm({ ...form, assetCode: e.target.value })} required />
          <input placeholder="Asset Name" value={form.assetName} onChange={e => setForm({ ...form, assetName: e.target.value })} required />
          <input type="number" placeholder="Quantity" value={form.quantity} onChange={e => setForm({ ...form, quantity: parseInt(e.target.value) || 0 })} required />
          <select value={form.category.id} onChange={e => setForm({ ...form, category: { id: e.target.value } })} required>
            <option value="">Select Category</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select value={form.base.id} onChange={e => setForm({ ...form, base: { id: e.target.value } })} required>
            <option value="">Select Base</option>
            {bases.map(b => <option key={b.id} value={b.id}>{b.baseName}</option>)}
          </select>
          <button type="submit" className="btn btn-primary">{editing ? 'Update' : 'Save'}</button>
        </form>
      )}

      {/* Assets Table */}
      <table>
        <thead>
          <tr>
            <th>Asset ID</th>
            <th>Asset Name</th>
            <th>Category</th>
            <th>Base</th>
            <th>In Stock</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(a => (
            <tr key={a.id}>
              <td><strong>{a.id}</strong></td>
              <td>{a.assetName}</td>
              <td>{a.category?.name}</td>
              <td>{a.base?.baseName}</td>
              <td><strong>{a.quantity}</strong></td>
            </tr>
          ))}
          {filtered.length === 0 && (
            <tr>
              <td colSpan={5} style={{ textAlign: 'center', padding: '20px', color: '#7f8c8d' }}>
                No assets found matching your criteria.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
