import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import './AssistenzaForm.css';

const API_BASE = process.env.REACT_APP_API_BASE;

function AssistenzaForm() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors }
  } = useForm();

  const [calculatedDuration, setCalculatedDuration] = useState('');
  const [timeError, setTimeError] = useState('');

  const startTime = watch('startTime');
  const endTime = watch('endTime');

  useEffect(() => {
    if (startTime && endTime) {
      const [startH, startM] = startTime.split(':').map(Number);
      const [endH, endM] = endTime.split(':').map(Number);
      const start = startH * 60 + startM;
      const end = endH * 60 + endM;

      if (end <= start) {
        setTimeError('⚠️ L\'orario di fine deve essere successivo all\'orario di inizio.');
        setCalculatedDuration('');
        setValue('duration', '');
      } else {
        setTimeError('');
        const diff = end - start;
        setCalculatedDuration(diff);
        setValue('duration', diff);
      }
    } else {
      setTimeError('');
    }
  }, [startTime, endTime, setValue]);

  const onSubmit = async data => {
    if (timeError) {
      alert('Errore negli orari: ' + timeError);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const resText = await res.text();
      if (!res.ok) throw new Error(`Errore ${res.status}: ${resText}`);
      const result = JSON.parse(resText);
      alert(result.message);
      reset();
    } catch (error) {
      console.error('❌ Errore invio:', error);
      alert("Errore durante l'invio. Controlla la console per i dettagli.");
    }
  };

  const handleExport = async () => {
    const token = localStorage.getItem('token');
    if (!token) return alert('Devi effettuare il login per esportare!');

    try {
      const res = await fetch(`${API_BASE}/api/submit`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Errore ${res.status}: ${errorText}`);
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'report-assistenze.xlsx';
      link.click();
    } catch (err) {
      console.error('❌ Errore esportazione:', err);
      alert("Errore durante l'esportazione. Guarda la console.");
    }
  };

  const technicians = ['Alberto Castagna', 'Andrea Tedesco', 'Giuseppe Carenza', 'Giuseppe Fasano', 'Greg J Mathews', 'Gianluca Limanni', 'Gabriele Magni', 'Luca Mellino', 'Riccardo Debenedetti', 'Roberto Tettamanzi', 'Simone Filippini', 'Stefano Rivolta', 'Vittorio Vitacchione'];
  const requestSources = ['Assistance', 'Email', 'Chiamata', 'Messaggio', 'Verbale'];
  const requestedFromOptions = ['Cliente', 'Interno'];
  const timeOptions = ['Ufficio', 'Fuori', 'We', 'Trasferta'];
  const topics = ['Installazione', 'Meccanico', 'Elettrico', 'Automazione', 'Avviamento', 'Processo', 'Meeting', 'Altro'];

  return (
    <div className="form-container">
      <h2 className="form-title">📝 Monitoraggio Assistenza</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="form">
        {/* ... tutti i tuoi campi restano invariati */}
        <button type="submit" className="form-button">✅ Invia</button>
      </form>

      {localStorage.getItem('token') && (
        <div className="logout-container" style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button onClick={handleExport} className="export-button">📥 Esporta Excel</button>
          <button onClick={() => navigate('/dashboard')} className="dashboard-button">📊 Vai alla Dashboard</button>
          <button onClick={() => {
            localStorage.removeItem('token');
            navigate('/login');
          }} className="logout-button">🔓 Logout</button>
        </div>
      )}
    </div>
  );
}

export default AssistenzaForm;
