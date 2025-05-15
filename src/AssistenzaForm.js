import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import './AssistenzaForm.css';

function AssistenzaForm() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm();

  const onSubmit = async data => {
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

  const technicians = ['AC', 'AT', 'GC', 'GF', 'GJ', 'GL', 'GM', 'LM', 'RD', 'RT', 'SF', 'SR', 'VV'];
  const requestSources = ['assistance', 'email', 'chiamata', 'messaggio', 'verbale'];
  const requestedFromOptions = ['cliente', 'interno'];
  const timeOptions = ['ufficio', 'fuori', 'we', 'trasferta'];
  const topics = ['installazione', 'meccanico', 'elettrico', 'automazione', 'avviamento', 'processo', 'meeting', 'altro'];

  return (
    <div className="form-container">
      <h2 className="form-title">📝 Modulo Assistenza</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="form">
        {/* Campi input */}
        <div className="form-group">
          <label className="required">👨‍🔧 Tecnico che compila</label>
          <input {...register('compiledBy', { required: true })} className="form-input" />
          {errors.compiledBy && <small className="error">Campo obbligatorio</small>}
        </div>

        <div className="form-group">
          <label>👤 Nome Cliente</label>
          <input {...register('clientName', { required: true })} className="form-input" />
          {errors.clientName && <small className="error">Campo obbligatorio</small>}
        </div>

        <div className="form-group">
          <label>🏢 Gruppo Cliente</label>
          <input {...register('clientGroup')} className="form-input" />
        </div>

        <div className="form-group">
          <label>📄 Numero Commessa</label>
          <input {...register('orderNumber')} className="form-input" />
        </div>

        <div className="form-group">
          <label>🔧 Tecnico Responsabile</label>
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
          <input {...register('startTime')} className="form-input" />
        </div>

        <div className="form-group">
          <label>⏳ Durata (minuti)</label>
          <input type="number" {...register('duration')} className="form-input" />
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
        <div className="logout-container" style={{ marginTop: '1.5rem' }}>
          <button onClick={() => navigate('/dashboard')} className="dashboard-button">
            📊 Vai alla Dashboard
          </button>
          <button onClick={() => {
            localStorage.removeItem('token');
            navigate('/login');
          }} className="logout-button">
            🔓 Logout
          </button>
        </div>
      )}
    </div>
  );
}

export default AssistenzaForm;
