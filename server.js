const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// In-memory storage for reports
let reports = [];
let nextId = 1;

// GET all reports
app.get('/api/reports', (req, res) => {
  res.json(reports);
});

// POST new report
app.post('/api/reports', (req, res) => {
  const { groupName, activityType, description, location } = req.body;
  
  const newReport = {
    id: nextId++,
    groupName,
    activityType,
    description,
    location,
    timestamp: new Date().toISOString()
  };
  
  reports.unshift(newReport);
  res.json(newReport);
});

// Serve React build files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});