import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AssistenzaForm from './AssistenzaForm';
import Dashboard from './Dashboard';
import Login from './Login';
import RegisterPage from './Register';
import Home from './Home'; // ✅

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />           {/* Pagina iniziale */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/form" element={<AssistenzaForm />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="*" element={<h2 style={{ textAlign: 'center' }}>404 - Pagina non trovata</h2>} />
      </Routes>
    </Router>
  );
}

export default App;
