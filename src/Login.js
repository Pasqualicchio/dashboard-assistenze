import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch('http://localhost:3001/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const contentType = res.headers.get('Content-Type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Risposta non valida dal server (non è JSON)');
      }

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Errore generico');
      }

      localStorage.setItem('token', data.token);
      navigate('/form'); // ✅ VAI AL FORM
    } catch (err) {
      console.error('Errore login:', err);
      setError(err.message || 'Errore di rete');
    }
  };

  return (
    <div className="form-container">
      <h2>🔐 Login</h2>
      <form onSubmit={handleLogin} className="form">
        <div className="form-group">
          <input
            type="email"
            placeholder="Email"
            className="form-input"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <input
            type="password"
            placeholder="Password"
            className="form-input"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit" className="form-button">Accedi</button>
      </form>
    </div>
  );
}

export default Login;
