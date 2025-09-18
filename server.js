const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// In-memory storage for reports (cleared to ensure clean data model)
let reports = [];
let nextId = 1;

// GET all reports
app.get('/api/reports', (req, res) => {
  res.json(reports);
});

// Zipcode lookup using Zippopotam.us
app.post('/api/validate-address', async (req, res) => {
  try {
    const { zipcode } = req.body;
    
    console.log(`Looking up zipcode: ${zipcode}`);
    
    const response = await fetch(`http://api.zippopotam.us/us/${zipcode}`);
    
    if (!response.ok) {
      return res.status(400).json({ error: 'Invalid zipcode' });
    }
    
    const data = await response.json();
    
    if (!data.places || !data.places[0]) {
      return res.status(400).json({ error: 'Zipcode not found' });
    }
    
    const place = data.places[0];
    const coords = [parseFloat(place.latitude), parseFloat(place.longitude)];
    
    console.log(`Zipcode ${zipcode} found:`, coords);
    
    res.json({
      valid: true,
      coordinates: { lat: coords[0], lng: coords[1] },
      address: { 
        city: place['place name'], 
        state: place['state abbreviation'], 
        zipcode 
      },
      centeringLevel: 'zip'
    });
    
  } catch (error) {
    console.error('Zipcode lookup error:', error);
    res.status(500).json({ error: 'Zipcode lookup failed' });
  }
});

// POST new report
app.post('/api/reports', (req, res) => {
  try {
    console.log('Received report data:', req.body);
    console.log('Contact data:', req.body.contact);
    
    const { groupName, activityType, description, contact, location } = req.body;
    
    if (!groupName || !activityType || !location) {
      console.log('Missing required fields: groupName, activityType, or location');
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    if (!contact || !contact.email) {
      console.log('Missing contact email');
      return res.status(400).json({ error: 'Contact email is required' });
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contact.email)) {
      console.log('Invalid email format');
      return res.status(400).json({ error: 'Invalid email format' });
    }
    
    const newReport = {
      id: nextId++,
      groupName,
      activityType,
      description,
      contact,
      location,
      timestamp: new Date().toISOString()
    };
    
    reports.unshift(newReport);
    console.log('Report saved:', newReport);
    console.log('Saved contact info:', newReport.contact);
    console.log('Returning to client:', newReport);
    res.json(newReport);
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
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