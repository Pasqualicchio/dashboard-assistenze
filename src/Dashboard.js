import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';
import { v4 as uuidv4 } from 'uuid';
import { API_BASE } from './config';

function Dashboard() {
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [searchFilters, setSearchFilters] = useState({});
  const [sortConfig, setSortConfig] = useState({ key: '', direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [userEmail, setUserEmail] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  const rowsPerPage = 10;

  const columns = [
    'clientName',
    'clientGroup',
    'orderNumber',
    'responsibleTechnician',
    'technician',
    'requestDate',
    'duration',
    'topic',
    'description'
  ];

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return navigate('/login');
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setUserEmail(payload.email);
      setIsAdmin(payload.email === 'admin@example.com');
    } catch {
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    fetch(`${API_BASE}/api/records`)
      .then(res => res.json())
      .then(data => {
        const normalized = data.map(r => ({
          ...r,
          _id: r._id || uuidv4(),
          clientName: r.clientName || '',
          clientGroup: r.clientGroup || '',
          orderNumber: r.orderNumber || '',
          responsibleTechnician: r.responsibleTechnician || '',
          technician: r.technician || '',
          requestDate: r.requestDate || '',
          duration: r.duration || '',
          topic: r.topic || '',
          description: r.description || '',
          modified: false
        }));
        setRecords(normalized);
      })
      .catch(err => console.error('Errore:', err));
  }, []);

  const handleChange = (id, field, value) => {
    setRecords(records.map(r =>
      r._id === id ? { ...r, [field]: value, modified: true } : r
    ));
  };

  const handleSave = async (id) => {
    const token = localStorage.getItem('token');
    const recordToUpdate = records.find(r => r._id === id);
    try {
      const res = await fetch(`${API_BASE}/api/records/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(recordToUpdate),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      alert(data.message);

      setRecords(records.map(r =>
        r._id === id ? { ...r, modified: false } : r
      ));
    } catch (err) {
      alert('Errore salvataggio: ' + err.message);
    }
  };

  const handleExport = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_BASE}/api/export`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'report-assistenze.xlsx';
      link.click();
    } catch (err) {
      alert('Errore esportazione: ' + err.message);
    }
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  const sorted = [...records].sort((a, b) => {
    if (!sortConfig.key) return 0;
    const aVal = a[sortConfig.key] || '';
    const bVal = b[sortConfig.key] || '';
    return sortConfig.direction === 'asc'
      ? aVal.localeCompare(bVal)
      : bVal.localeCompare(aVal);
  });

  const filtered = sorted.filter(r =>
    Object.entries(searchFilters).every(([key, val]) =>
      r[key]?.toString().toLowerCase().includes(val.toLowerCase())
    )
  );

  const paginated = filtered.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);
  const totalPages = Math.ceil(filtered.length / rowsPerPage);

  return (
    <div className="dashboard-container">
      <h2>📊 Dashboard Assistenze</h2>
      <div className="dashboard-header">
        <span>👤 {userEmail}</span>
      </div>

      <table className="dashboard-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col} onClick={() => handleSort(col)} style={{ cursor: 'pointer' }}>
                {col.charAt(0).toUpperCase() + col.slice(1)}
                {sortConfig.key === col ? (sortConfig.direction === 'asc' ? ' 🔼' : ' 🔽') : ''}
              </th>
            ))}
            <th>Azioni</th>
          </tr>
          <tr>
            {columns.map((col) => (
              <th key={`filter-${col}`}>
                <input
                  type="text"
                  placeholder="Filtra..."
                  value={searchFilters[col] || ''}
                  onChange={(e) => setSearchFilters({ ...searchFilters, [col]: e.target.value })}
                />
              </th>
            ))}
            <th />
          </tr>
        </thead>
        <tbody>
          {paginated.map((r) => (
            <tr key={r._id} style={r.modified ? { backgroundColor: '#fff7cc' } : {}}>
              <td><input value={r.clientName} onChange={e => handleChange(r._id, 'clientName', e.target.value)} /></td>
              <td><input value={r.clientGroup} onChange={e => handleChange(r._id, 'clientGroup', e.target.value)} /></td>
              <td><input value={r.orderNumber} onChange={e => handleChange(r._id, 'orderNumber', e.target.value)} /></td>
              <td><input value={r.responsibleTechnician} onChange={e => handleChange(r._id, 'responsibleTechnician', e.target.value)} /></td>
              <td><input value={r.technician} onChange={e => handleChange(r._id, 'technician', e.target.value)} /></td>
              <td><input type="date" value={r.requestDate} onChange={e => handleChange(r._id, 'requestDate', e.target.value)} /></td>
              <td><input type="number" value={r.duration} onChange={e => handleChange(r._id, 'duration', e.target.value)} /></td>
              <td><input value={r.topic} onChange={e => handleChange(r._id, 'topic', e.target.value)} /></td>
              <td>
                <textarea
                  value={r.description}
                  onChange={e => handleChange(r._id, 'description', e.target.value)}
                  rows={2}
                  style={{ width: '100%' }}
                />
              </td>
              <td>
                <button className="button button-save" onClick={() => handleSave(r._id)}>💾</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="pagination">
        <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>⬅️</button>
        <span>Pagina {currentPage} di {totalPages}</span>
        <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>➡️</button>
      </div>

      <div className="dashboard-actions">
        {isAdmin && (
          <button className="button button-export" onClick={handleExport}>📥 Esporta</button>
        )}
        <button className="button button-form" onClick={() => navigate('/form')}>📝 Torna al Modulo</button>
        <button className="button button-logout" onClick={() => {
          localStorage.removeItem('token');
          navigate('/login');
        }}>
          🔓 Logout
        </button>
      </div>
    </div>
  );
}

export default Dashboard;
