import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE } from './config'; // ✅ Import base API URL

function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Funzione di validazione email
  const validateEmail = (email) => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(String(email).toLowerCase());
  };

  // Gestione invio form
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validazione email e password
    if (!validateEmail(email)) {
      setMessage('❌ Email non valida');
      return;
    }

    if (password.length < 8) {
      setMessage('❌ La password deve essere di almeno 8 caratteri');
      return;
    }

    setMessage('');
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || 'Errore nella registrazione');
      }

      setMessage('✅ Registrazione avvenuta con successo!');
      setTimeout(() => navigate('/login'), 2000); // Naviga dopo 2 secondi
    } catch (err) {
      setMessage(`❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', textAlign: 'center' }}>
      <h2>📝 Registrazione Nuovo Utente</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ padding: '10px', marginBottom: '10px', width: '100%' }}
        />
        <input
          type="password"
          placeholder="Password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ padding: '10px', marginBottom: '10px', width: '100%' }}
        />
        <button type="submit" style={{ padding: '10px', width: '100%' }} disabled={loading}>
          {loading ? '🔄 Registrazione...' : '➕ Registra'}
        </button>
      </form>
      {message && <p style={{ marginTop: '10px' }}>{message}</p>}
    </div>
  );
}

export default RegisterPage;
