import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [search, setSearch] = useState('');
  const [filterTech, setFilterTech] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return navigate('/login');
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setUserEmail(payload.email);
      setIsAdmin(payload.email === 'admin@example.com');
    } catch (err) {
      console.error('Errore nel token:', err);
      navigate('/login');
    }
  }, [navigate]);

  const fetchRecords = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/records');
      const data = await res.json();
      setRecords(data);
    } catch (err) {
      console.error('Errore caricamento:', err);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const handleChange = (index, field, value) => {
    const updated = [...records];
    updated[index][field] = value;
    updated[index].modified = true;
    setRecords(updated);
  };

  const handleSave = async (index) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:3001/api/records/${index}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(records[index])
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Errore aggiornamento');

      alert(data.message);
      fetchRecords();
    } catch (err) {
      alert('Errore: ' + err.message);
    }
  };

  const handleExport = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:3001/api/export', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Errore esportazione');
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'report-assistenze.xlsx';
      link.click();
    } catch (err) {
      alert('❌ ' + err.message);
    }
  };

  const filtered = records.filter(r => {
    const matchesTech = !filterTech || r.technician === filterTech;
    const matchesSearch = !search || Object.values(r).some(v =>
      String(v).toLowerCase().includes(search.toLowerCase())
    );
    return matchesTech && matchesSearch;
  });

  return (
    <div style={{ padding: '2rem' }}>
      <h2>📊 Dashboard Assistenze</h2>
      {userEmail && <p style={{ textAlign: 'right' }}>👤 {userEmail}</p>}

      <div style={{ marginBottom: '1rem' }}>
        🔧 Tecnico:
        <select value={filterTech} onChange={e => setFilterTech(e.target.value)} style={{ marginLeft: 5 }}>
          <option value="">Tutti</option>
          {[...new Set(records.map(r => r.technician))].map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        🔍 Ricerca:
        <input
          placeholder="Cerca..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ marginLeft: 5 }}
        />
      </div>

      <table border="1" cellPadding={6} style={{ width: '100%', background: '#fff' }}>
        <thead>
          <tr>
            <th>Cliente</th>
            <th>Commessa</th>
            <th>Tecnico</th>
            <th>Data</th>
            <th>Durata</th>
            <th>Categoria</th>
            <th>Azioni</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((r, i) => (
            <tr key={i} style={r.modified ? { backgroundColor: '#fffae6' } : {}}>
              <td><input value={r.clientName} onChange={e => handleChange(i, 'clientName', e.target.value)} /></td>
              <td><input value={r.orderNumber} onChange={e => handleChange(i, 'orderNumber', e.target.value)} /></td>
              <td><input value={r.technician} onChange={e => handleChange(i, 'technician', e.target.value)} /></td>
              <td><input type="date" value={r.requestDate || ''} onChange={e => handleChange(i, 'requestDate', e.target.value)} /></td>
              <td><input type="number" value={r.duration} onChange={e => handleChange(i, 'duration', e.target.value)} /></td>
              <td><input value={r.topic} onChange={e => handleChange(i, 'topic', e.target.value)} /></td>
              <td><button onClick={() => handleSave(i)}>💾 Salva</button></td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ marginTop: '2rem', display: 'flex', gap: '10px' }}>
        {isAdmin && (
          <button onClick={handleExport}>📥 Esporta Excel</button>
        )}
        <button onClick={() => navigate('/form')}>📝 Torna al Modulo</button>
        <button onClick={() => {
          localStorage.removeItem('token');
          navigate('/login');
        }}>🔓 Logout</button>
      </div>
    </div>
  );
}

export default Dashboard;
