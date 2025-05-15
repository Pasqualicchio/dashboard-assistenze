// src/Home.js
import React from 'react';
import { useNavigate } from 'react-router-dom';

function Home() {
  const navigate = useNavigate();

  return (
    <div style={{ textAlign: 'center', marginTop: '100px' }}>
      <h2>👋 Benvenuto!</h2>
      <p>Accedi o registrati per continuare</p>
      <button onClick={() => navigate('/login')} style={{ marginRight: '10px', padding: '10px 20px' }}>
        🔐 Accedi
      </button>
      <button onClick={() => navigate('/register')} style={{ padding: '10px 20px' }}>
        📝 Registrati
      </button>
    </div>
  );
}

export default Home;
