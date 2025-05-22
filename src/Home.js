// src/Home.js
import React from 'react';
import { useNavigate } from 'react-router-dom';

function Home() {
  const navigate = useNavigate();

  return (
    <div style={{ textAlign: 'center', marginTop: '100px' }}>
      <h2>👋 Benvenuto!</h2>
      <p>Accedi o registrati per continuare</p>
      <div style={{ marginTop: '20px' }}>
        <button
          onClick={() => navigate('/login')}
          style={{
            marginRight: '10px',
            padding: '10px 20px',
            fontSize: '16px',
            cursor: 'pointer'
          }}
        >
          🔐 Accedi
        </button>
        <button
          onClick={() => navigate('/register')}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            cursor: 'pointer'
          }}
        >
          📝 Registrati
        </button>
      </div>
    </div>
  );
}

export default Home;