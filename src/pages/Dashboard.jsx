import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getDashboardSummary, getBases } from '../services/api';

export default function Dashboard() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [bases, setBases] = useState([]);
  const [selectedBase, setSelectedBase] = useState('');
  const [showNetDetail, setShowNetDetail] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadBases();
  }, []);

  useEffect(() => {
    loadSummary();
  }, [selectedBase]);

  const loadBases = async () => {
    try {
      const res = await getBases();
      setBases(res.data);
    } catch (err) {
      setError('Failed to load bases');
    }
  };

  const loadSummary = async () => {
    try {
      const res = await getDashboardSummary(selectedBase || null);
      setSummary(res.data);
    } catch (err) {
      setError('Failed to load dashboard metrics');
    }
  };

  if (!summary) return <p style={{ padding: '20px' }}>Loading dashboard...</p>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h2>Asset Dashboard</h2>
      </div>

      {error && <div className="error-msg">{error}</div>}

      {/* Filter Bar with access to all bases */}
      <div className="filter-bar" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
        <label style={{ fontWeight: 'bold' }}>Filter by Base:</label>
        <select value={selectedBase} onChange={e => setSelectedBase(e.target.value)}>
          <option value="">All Bases</option>
          {bases.map(b => (
            <option key={b.id} value={b.id}>{b.baseName} ({b.baseCode})</option>
          ))}
        </select>
      </div>

      {/* Summary Cards */}
      <div className="dashboard-cards">
        <div className="card clickable" style={{ borderLeft: '4px solid #2980b9' }} onClick={() => setShowNetDetail(!showNetDetail)}>
          <h3>Net Movement</h3>
          <p className="card-value" style={{ color: summary.netMovement >= 0 ? '#27ae60' : '#c0392b' }}>
            {summary.netMovement}
          </p>
          <small style={{ color: '#2980b9' }}>Click for breakdown ⇄</small>
        </div>

        <div className="card" style={{ borderLeft: '4px solid #16a085' }}>
          <h3>Purchases</h3>
          <p className="card-value" style={{ color: '#16a085' }}>{summary.purchases}</p>
          <small style={{ color: '#7f8c8d' }}>Stock acquired</small>
        </div>

        <div className="card" style={{ borderLeft: '4px solid #2980b9' }}>
          <h3>Transfer In</h3>
          <p className="card-value" style={{ color: '#2980b9' }}>{summary.transferIn}</p>
          <small style={{ color: '#7f8c8d' }}>Received from bases</small>
        </div>

        <div className="card" style={{ borderLeft: '4px solid #e67e22' }}>
          <h3>Transfer Out</h3>
          <p className="card-value" style={{ color: '#e67e22' }}>{summary.transferOut}</p>
          <small style={{ color: '#7f8c8d' }}>Dispatched to bases</small>
        </div>

        <div className="card" style={{ borderLeft: '4px solid #8e44ad' }}>
          <h3>Assigned Assets</h3>
          <p className="card-value" style={{ color: '#8e44ad' }}>{summary.assignedAssets}</p>
          <small style={{ color: '#7f8c8d' }}>Issued to personnel</small>
        </div>

        <div className="card" style={{ borderLeft: '4px solid #c0392b' }}>
          <h3>Expended Assets</h3>
          <p className="card-value" style={{ color: '#c0392b' }}>{summary.expendedAssets}</p>
          <small style={{ color: '#7f8c8d' }}>Consumed / Expended</small>
        </div>
      </div>

      {showNetDetail && (
        <div className="net-detail-box" style={{ background: '#fff', border: '1px solid #ddd', borderRadius: '6px', padding: '20px', marginTop: '20px' }}>
          <h3 style={{ marginBottom: '10px', color: '#2c3e50' }}>Inventory Movement Breakdown</h3>
          <table style={{ width: '100%', maxWidth: '500px', marginBottom: '15px' }}>
            <tbody>
              <tr>
                <td>Purchases</td>
                <td style={{ textAlign: 'right', color: '#27ae60', fontWeight: 'bold' }}>{summary.purchases}</td>
              </tr>
              <tr>
                <td>Transfer In</td>
                <td style={{ textAlign: 'right', color: '#2980b9', fontWeight: 'bold' }}>{summary.transferIn}</td>
              </tr>
              <tr>
                <td>Transfer Out</td>
                <td style={{ textAlign: 'right', color: '#e67e22', fontWeight: 'bold' }}>{summary.transferOut}</td>
              </tr>
              <tr style={{ borderTop: '1px solid #ccc', borderBottom: '1px solid #ccc' }}>
                <td><strong>Net Movement</strong></td>
                <td style={{ textAlign: 'right', fontWeight: 'bold' }}>{summary.netMovement}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
