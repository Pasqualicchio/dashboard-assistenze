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
  const [isSpeechRecognitionAvailable, setIsSpeechRecognitionAvailable] = useState(true); // Aggiunto per la gestione compatibilità


   // ✅ Protezione accesso: mostra la form solo se c'è il token
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    } else {
      setLoading(false);
    }
  }, [navigate]);

  const startTime = watch('startTime');
  const endTime = watch('endTime');

  // ⏱ Calcolo durata
  useEffect(() => {
    const startTime = watch('startTime');
    const endTime = watch('endTime');

    if (startTime && endTime) {
      const [startH, startM] = startTime.split(':').map(Number);
      const [endH, endM] = endTime.split(':').map(Number);
      const start = startH * 60 + startM;
      const end = endH * 60 + endM;

      if (end <= start) {
        setTimeError("⚠️ L'orario di fine deve essere successivo all'orario di inizio.");
        setValue('duration', '');
      } else {
        setTimeError('');
        setValue('duration', end - start); // calcola i minuti
      }
    }
  }, [watch('startTime'), watch('endTime'), setValue]);

  // ✅ Invio form
  const onSubmit = async (data) => {
    if (timeError) {
      alert('Errore negli orari: ' + timeError);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
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

  // ✅ Esportazione Excel
  const handleExport = async () => {
    const token = localStorage.getItem('token');
    if (!token) return alert('Devi effettuare il login per esportare!');

    try {
      const res = await fetch(`${API_BASE}/api/export`, {
        headers: { Authorization: `Bearer ${token}` },
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
 // Verifica compatibilità con il riconoscimento vocale
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSpeechRecognitionAvailable(false);
    } else {
      setIsSpeechRecognitionAvailable(true);
    }
  }, []);

  // Funzione per avviare il riconoscimento vocale
  const startVoiceRecognition = () => {
    if (!isSpeechRecognitionAvailable) {
      alert("Il riconoscimento vocale non è supportato nel tuo browser.");
      return;
    }

    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = 'it-IT';
    recognition.start();

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setValue('description', transcript); // Inserisce il testo riconosciuto nel campo descrizione
    };

    recognition.onerror = (event) => {
      console.error("Errore nel riconoscimento vocale:", event.error);
      alert("Si è verificato un errore nel riconoscimento vocale.");
    };
  };
  const technicians = ['Alberto Castagna', 'Andrea Tedesco', 'Giuseppe Carenza', 'Giuseppe Fasano', 'Greg J Mathews', 'Gianluca Limanni', 'Gabriele Magni', 'Luca Mellino', 'Riccardo Debenedetti', 'Roberto Tettamanzi', 'Simone Filippini', 'Stefano Rivolta', 'Vittorio Vitacchione'];
  const requestSources = ['Assistance', 'Email', 'Chiamata', 'Messaggio', 'Verbale'];
  const requestedFromOptions = ['Cliente', 'Interno'];
  const timeOptions = ['Ufficio', 'Fuori', 'We', 'Trasferta'];
  const topics = ['Installazione', 'Meccanico', 'Elettrico', 'Automazione', 'Avviamento', 'Processo', 'Meeting', 'Altro'];

  if (loading) return null; // 🔒 Aspetta controllo token prima di mostrare il form

  return (
  <div className="form-container">
    <h2 className="form-title">📝 Monitoraggio Assistenza</h2>

    <form onSubmit={handleSubmit(onSubmit)} className="form">
      <div className="form-group">
        <label>👤 Tecnico</label>
        <select {...register('technician')} className="form-input" required>
          <option value="">-- Seleziona --</option>
          {technicians.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      <div className="form-group">
        <label>🏢 Nome Cliente</label>
        <input
          type="text"
          {...register('clientName')}
          className="form-input"
          placeholder="Inserisci il nome del cliente"
          required
        />
      </div>

      <div className="form-group">
        <label>👥 Gruppo Cliente</label>
        <input
          type="text"
          {...register('clientGroup')}
          className="form-input"
          placeholder="Inserisci il gruppo cliente"
        />
      </div>

      <div className="form-group">
        <label>📦 Numero Commessa</label>
        <input
          type="text"
          {...register('orderNumber')}
          className="form-input"
          placeholder="Inserisci il numero commessa"
        />
      </div>

      <div className="form-group">
        <label>👨‍💼 Tecnico Responsabile</label>
        <select {...register('responsibleTechnician')} className="form-input">
          <option value="">-- Seleziona --</option>
          {technicians.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      <div className="form-group">
        <label>📅 Data</label>
        <input type="date" {...register('date')} className="form-input" required />
      </div>

      <div className="form-group">
        <label>🕒 Ora Inizio</label>
        <input type="time" {...register('startTime')} className="form-input" required />
      </div>

      <div className="form-group">
  <label>🕔 Ora Fine</label>
  <input
    type="time"
    {...register('endTime')}
    className="form-input"
    required
  />
  {timeError && <p className="error">{timeError}</p>}
</div>

<div className="form-group">
  <label>⏱️ Durata (minuti)</label>
  <input
    type="number"
    {...register('duration')}
    className="form-input"
    readOnly
  />
</div>


      <input type="hidden" {...register('duration')} />

      <div className="form-group">
        <label>🔄 Fonte Richiesta</label>
        <select {...register('requestSource')} className="form-input" required>
          <option value="">-- Seleziona --</option>
          {requestSources.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>

      <div className="form-group">
        <label>📨 Da chi è stata richiesta</label>
        <select {...register('requestedFrom')} className="form-input" required>
          <option value="">-- Seleziona --</option>
          {requestedFromOptions.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      </div>

      <div className="form-group">
        <label>📍 Tipo Tempo</label>
        <select {...register('timeType')} className="form-input" required>
          <option value="">-- Seleziona --</option>
          {timeOptions.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      </div>

      <div className="form-group">
        <label>📌 Argomento</label>
        <select {...register('topic')} className="form-input" required>
          <option value="">-- Seleziona --</option>
          {topics.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

       <div className="form-group" style={{ gridColumn: '1 / -1' }}>
          <label>📝 Descrizione</label>
          <textarea
            {...register('description')}
            className="form-input"
            required
            placeholder="Inserisci una descrizione dettagliata..."
          />
          {isSpeechRecognitionAvailable && (
            <button type="button" onClick={startVoiceRecognition} style={{ marginTop: '10px' }}>
              🎤 Usa Voce
            </button>
          )}
        </div>

      <button type="submit" className="form-button" style={{ gridColumn: '1 / -1' }}>
        ✅ Invia
      </button>
    </form>

      {localStorage.getItem('token') && (
        <div className="logout-container">
          <button onClick={handleExport} className="export-button">📥 Esporta Excel</button>
          <button onClick={() => navigate('/dashboard')} className="dashboard-button">📊 Vai alla Dashboard</button>
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
