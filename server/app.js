const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const xlsx = require('xlsx');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

const app = express();

const SECRET_KEY = process.env.JWT_SECRET || 'supersegreta_jwt_2025';
const PORT = process.env.PORT || 3001;

const dataFile = path.join(__dirname, 'data', 'records.json');
const usersFile = path.join(__dirname, 'data', 'users.json');
const exportPath = path.join(__dirname, 'data', 'export.xlsx');

app.use(cors());
app.use(bodyParser.json());

/* 📥 Salvataggio nuovo record con validazione orari */
app.post('/api/submit', (req, res) => {
  const { startTime, endTime } = req.body;

  if (!startTime || !endTime) {
    return res.status(400).json({ error: 'Orari mancanti' });
  }

  const [startH, startM] = startTime.split(':').map(Number);
  const [endH, endM] = endTime.split(':').map(Number);
  const start = startH * 60 + startM;
  const end = endH * 60 + endM;

  if (end <= start) {
    return res.status(400).json({ error: "L'orario di fine deve essere successivo all'orario di inizio" });
  }

  const newEntry = {
    ...req.body,
    duration: end - start,
    _id: uuidv4()
  };

  let records = [];

  try {
    if (fs.existsSync(dataFile)) {
      records = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
    }

    records.push(newEntry);
    fs.writeFileSync(dataFile, JSON.stringify(records, null, 2));
    console.log('✅ Nuovo record aggiunto:', newEntry);
    res.json({ message: 'Dati salvati con successo!' });
  } catch (err) {
    console.error('❌ Errore salvataggio:', err);
    res.status(500).json({ error: 'Errore nel salvataggio dei dati' });
  }
});

/* 📊 Visualizza tutti i record */
app.get('/api/records', (req, res) => {
  try {
    if (!fs.existsSync(dataFile)) return res.json([]);
    const records = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
    res.json(records);
  } catch (err) {
    console.error('❌ Errore lettura dati:', err);
    res.status(500).json({ error: 'Errore nella lettura dei dati' });
  }
});

/* 🔁 Modifica record con validazione orari */
app.put('/api/records/:id', (req, res) => {
  const { id } = req.params;
  const updatedData = req.body;

  // Validazione orari
  const { startTime, endTime } = updatedData;
  if (startTime && endTime) {
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);
    const start = startH * 60 + startM;
    const end = endH * 60 + endM;

    if (end <= start) {
      return res.status(400).json({
        error: "L'orario di fine deve essere successivo all'orario di inizio"
      });
    }

    // Se valido, aggiorna anche la durata
    updatedData.duration = end - start;
  }

  if (!fs.existsSync(dataFile)) {
    return res.status(404).json({ error: 'Nessun record trovato' });
  }

  let records = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
  const index = records.findIndex(r => r._id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Record non trovato' });
  }

  records[index] = { ...records[index], ...updatedData };
  fs.writeFileSync(dataFile, JSON.stringify(records, null, 2));

  res.json({ message: 'Record aggiornato con successo' });
});

/* 📤 Esportazione in Excel */
app.get('/api/export', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(403).json({ error: 'Token mancante' });

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    if (decoded.email !== 'admin@example.com') {
      return res.status(403).json({ error: 'Accesso negato' });
    }
  } catch {
    return res.status(403).json({ error: 'Token non valido' });
  }

  if (!fs.existsSync(dataFile)) {
    return res.status(404).json({ error: 'Nessun dato da esportare' });
  }

  const records = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
  const ws = xlsx.utils.json_to_sheet(records);
  const wb = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(wb, ws, 'Assistenze');
  xlsx.writeFile(wb, exportPath);

  res.download(exportPath, 'report-assistenze.xlsx');
});

/* 🔐 Registrazione */
app.post('/api/register', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email e password richieste' });

  let users = [];
  if (fs.existsSync(usersFile)) {
    users = JSON.parse(fs.readFileSync(usersFile, 'utf8'));
  }

  if (users.find(u => u.email === email)) {
    return res.status(409).json({ error: 'Utente già registrato' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  users.push({ email, password: hashedPassword });
  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));

  res.json({ message: 'Registrazione avvenuta con successo' });
});

/* 🔐 Login */
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  let users = [];
  if (fs.existsSync(usersFile)) {
    users = JSON.parse(fs.readFileSync(usersFile, 'utf8'));
  }

  const user = users.find(u => u.email === email);
  if (!user) return res.status(401).json({ error: 'Credenziali non valide' });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).json({ error: 'Credenziali non valide' });

  const token = jwt.sign({ email }, SECRET_KEY, { expiresIn: '2h' });
  res.json({ token });
});

/* 🌐 Root */
app.get('/', (req, res) => {
  res.send('🚀 Backend attivo!');
});

/* ▶️ Avvio server */
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server in ascolto su http://localhost:${PORT}`);
});
