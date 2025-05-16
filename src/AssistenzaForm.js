import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import './AssistenzaForm.css';

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
      const res = await fetch('http://localhost:3001/api/submit', {
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
      const res = await fetch('http://localhost:3001/api/export', {
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
        <div className="form-group">
          <label className="required"> 🚀 Tecnico Responsabile</label>      
          <select {...register('technician', { required: true })} className="form-select">
            <option value="">Seleziona...</option>
            {technicians.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          {errors.technician && <small className="error">Campo obbligatorio</small>}
        </div>

        <div className="form-group">
          <label className="required">👔 Nome Cliente</label>
          <input {...register('clientName', { required: true })} className="form-input" />
          {errors.clientName && <small className="error">Campo obbligatorio</small>}
        </div>

        <div className="form-group">
          <label>🏢 Gruppo Cliente</label>
          <input {...register('clientGroup')} className="form-input" />
        </div>
               <div className="form-group">
          <label className="required">📑 Numero Commessa</label>
          <input {...register('clientName', { required: true })} className="form-input" />
          {errors.clientName && <small className="error">Campo obbligatorio</small>}
        </div>

        <div className="form-group">
          <label>🦺 Tecnico Responsabile</label>
          <select {...register('technician', { required: true })} className="form-select">
            <option value="">Seleziona...</option>
            {technicians.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          {errors.technician && <small className="error">Campo obbligatorio</small>}
        </div>

        <div className="form-group">
          <label>✉️ Origine Richiesta</label>
          <select {...register('requestSource', { required: true })} className="form-select">
            <option value="">Seleziona...</option>
            {requestSources.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          {errors.requestSource && <small className="error">Campo obbligatorio</small>}
        </div>

        <div className="form-group">
          <label>📨 Richiesta da</label>
          <select {...register('requestedFrom')} className="form-select">
            <option value="">Seleziona...</option>
            {requestedFromOptions.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>

        <div className="form-group">
          <label>📅 Data Richiesta</label>
          <input type="date" {...register('requestDate')} className="form-input" />
        </div>

        <div className="form-group">
          <label>⏰ Fascia Oraria</label>
          <select {...register('time')} className="form-select">
            <option value="">Seleziona...</option>
            {timeOptions.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

<div className="form-group">
  <label>🕒 Orario Inizio</label>
  <input
    type="time"
    {...register('startTime')}
    className={`form-input ${timeError ? 'input-error' : ''}`}
  />
</div>

<div className="form-group">
  <label>🕒 Orario Fine</label>
  <input
    type="time"
    {...register('endTime')}
    className={`form-input ${timeError ? 'input-error' : ''}`}
  />
</div>

{timeError && (
  <div className="form-error" style={{ marginTop: '-0.5rem', marginBottom: '0.8rem' }}>
    {timeError}
  </div>
)}

<div className="form-group">
  <label>⏳ Durata (minuti)</label>
  <input
    type="number"
    {...register('duration')}
    className="form-input duration-field"
    value={calculatedDuration}
    readOnly
  />
</div>


        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
          <label>🛠️ Descrizione Intervento</label>
          <textarea {...register('description')} className="form-textarea" />
        </div>

        <div className="form-group">
          <label>📂 Categoria</label>
          <select {...register('topic')} className="form-select">
            <option value="">Seleziona...</option>
            {topics.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

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
