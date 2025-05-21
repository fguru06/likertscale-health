const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const app = express();
const PORT = 3001;

app.use(cors());
app.use(bodyParser.json());

// SQLite setup
const db = new sqlite3.Database('./survey.db', (err) => {
  if (err) throw err;
  db.run(`CREATE TABLE IF NOT EXISTS responses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    answers TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
});

// Save survey response
app.post('/api/submit', (req, res) => {
  const { answers } = req.body;
  db.run('INSERT INTO responses (answers) VALUES (?)', [JSON.stringify(answers)], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, id: this.lastID });
  });
});

// Get all responses
app.get('/api/results', (req, res) => {
  db.all('SELECT answers FROM responses', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    const allAnswers = rows.map(r => JSON.parse(r.answers));
    res.json({ results: allAnswers });
  });
});

app.listen(PORT, () => console.log(`Survey API running on http://localhost:${PORT}`));
