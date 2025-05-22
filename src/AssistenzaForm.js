import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import './AssistenzaForm.css';
import { API_BASE } from './config';

function AssistenzaForm() {
  const navigate = useNavigate();
  const { register, handleSubmit, reset, watch, setValue } = useForm();
  const [timeError, setTimeError] = useState('');
  const [loading, setLoading] = useState(true);

  // 🔐 Protezione: se manca il token, vai al login
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    } else {
      setLoading(false);
    }
  }, [navigate]);

  // ⏱ Calcolo durata automatica
  const startTime = watch('startTime');
  const endTime = watch('endTime');

  useEffect(() => {
    if (startTime && endTime) {
      const [h1, m1] = startTime.split(':').map(Number);
      const [h2, m2] = endTime.split(':').map(Number);
      const start = h1 * 60 + m1;
      const end = h2 * 60 + m2;

      if (end <= start) {
        setTimeError("⚠️ L'orario di fine deve essere dopo l'inizio");
        setValue('duration', '');
      } else {
        setTimeError('');
        setValue('duration', end - start);
      }
    }
  }, [startTime, endTime, setValue]);

  // 🚀 Invia form
  const onSubmit = async (data) => {
    try {
      const res = await fetch(`${API_BASE}/api/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Errore salvataggio');

      alert('✅ Dati inviati con successo!');
      reset();
    } catch (err) {
      console.error('Errore:', err);
      alert('❌ Errore durante il salvataggio');
    }
  };

  // 📤 Esportazione
  const handleExport = async () => {
    const token = localStorage.getItem('token');
    if (!token) return alert('🔐 Devi prima accedere');

    try {
      const res = await fetch(`${API_BASE}/api/export`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error(await res.text());

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'report-assistenze.xlsx';
      link.click();
    } catch (err) {
      alert('❌ Errore esportazione: ' + err.message);
    }
  };

  // Liste a discesa
  const technicians = ['Alberto Castagna', 'Andrea Tedesco', 'Giuseppe Carenza'];
  const requestSources = ['Assistance', 'Email', 'Chiamata'];
  const requestedFrom = ['Cliente', 'Interno'];
  const timeTypes = ['Ufficio', 'Fuori', 'Trasferta'];
  const topics = ['Installazione', 'Elettrico', 'Altro'];

  if (loading) return null; // ⏳ Blocca finché non controlla il token

  return (
  <div>
    <h2>Test Form</h2>
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('nome')} placeholder="Nome" />
      <button type="submit">Invia</button>
    </form>
  </div>
);

}

export default AssistenzaForm;
