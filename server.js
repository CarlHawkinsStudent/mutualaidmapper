const express = require('express');
const cors = require('cors');
const path = require('path');
const https = require('https');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { createServer } = require('http');
const { Server } = require('socket.io');

const app = express();
const server = createServer(app);
const io = new Server(server, { cors: { origin: "*" } });
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

app.use(cors());
app.use(express.json());

// In-memory storage
let users = [];
let groups = [];
let messages = [];
let activities = [];
let nextUserId = 1;
let nextGroupId = 1;
let nextMessageId = 1;
let nextId = 1;

// Reset all data and create fresh admin user
const resetAndCreateAdmin = async () => {
  // Clear all existing data
  users.length = 0;
  groups.length = 0;
  messages.length = 0;
  activities.length = 0;
  
  // Reset counters
  nextUserId = 1;
  nextGroupId = 1;
  nextMessageId = 1;
  nextId = 1;
  
  // Create fresh admin user
  const hashedPassword = await bcrypt.hash('LoveWillWin', 10);
  users.push({
    id: nextUserId++,
    username: 'root',
    email: 'admin@mutualaid.local',
    passwordHash: hashedPassword,
    groups: [],
    zipcode: '',
    pronouns: '',
    bio: 'System Administrator',
    isAdmin: true
  });
  
  // Add sample activities for testing time controls
  const now = new Date();
  const sampleActivities = [
    {
      id: nextId++,
      groupName: 'Downtown Food Bank',
      activityType: 'Food Distribution',
      description: 'Free groceries for families in need',
      contact: { email: 'contact@foodbank.org' },
      location: { lat: 40.7128, lng: -74.0060, city: 'New York', state: 'NY', zipcode: '10001' },
      timestamp: new Date(now.getTime() - 3 * 60 * 60 * 1000).toISOString() // 3 hours ago
    },
    {
      id: nextId++,
      groupName: 'Community Shelter',
      activityType: 'Shelter',
      description: 'Temporary housing assistance',
      contact: { email: 'help@shelter.org' },
      location: { lat: 34.0522, lng: -118.2437, city: 'Los Angeles', state: 'CA', zipcode: '90210' },
      timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString() // 2 hours ago
    },
    {
      id: nextId++,
      groupName: 'Medical Aid Network',
      activityType: 'Medical Supplies',
      description: 'First aid supplies and basic medical care',
      contact: { email: 'medaid@network.org' },
      location: { lat: 41.8781, lng: -87.6298, city: 'Chicago', state: 'IL', zipcode: '60601' },
      timestamp: new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString() // 1 hour ago
    },
    {
      id: nextId++,
      groupName: 'Clothing Drive',
      activityType: 'Clothing Drive',
      description: 'Winter coats and warm clothing',
      contact: { email: 'clothes@drive.org' },
      location: { lat: 39.7392, lng: -104.9903, city: 'Denver', state: 'CO', zipcode: '80202' },
      timestamp: now.toISOString() // Current hour
    }
  ];
  
  activities.push(...sampleActivities);
  
  console.log('Data reset complete. Root admin user and sample activities created.');
};
resetAndCreateAdmin();

console.log('Using in-memory storage');

// Auth middleware
const auth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'No token' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.error('Auth error:', err.message);
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Admin middleware
const adminAuth = (req, res, next) => {
  if (!req.user.isAdmin) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};



// GET all activities
app.get('/api/activities', (req, res) => {
  res.json(activities);
});

// Zipcode lookup using Zippopotam.us
app.post('/api/validate-address', async (req, res) => {
  try {
    const { zipcode } = req.body;
    console.log(`Looking up zipcode: ${zipcode}`);

    if (!zipcode || !/^\d{5}$/.test(zipcode)) {
      console.log('Invalid zipcode format');
      return res.status(400).json({ error: 'Invalid zipcode format' });
    }

    const apiUrl = `http://api.zippopotam.us/us/${zipcode}`;
    const http = require('http');

    const data = await new Promise((resolve, reject) => {
      const req = http.get(apiUrl, (response) => {
        if (response.statusCode !== 200) {
          reject(new Error('Zipcode not found'));
          return;
        }

        let body = '';
        response.on('data', (chunk) => {
          body += chunk;
        });

        response.on('end', () => {
          try {
            const jsonData = JSON.parse(body);
            resolve(jsonData);
          } catch (error) {
            reject(new Error('Invalid API response'));
          }
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      req.setTimeout(5000, () => {
        req.destroy();
        reject(new Error('API request timeout'));
      });
    });

    if (!data.places || !data.places[0]) {
      return res.status(400).json({ error: 'Zipcode not found' });
    }

    const place = data.places[0];
    const coords = [parseFloat(place.latitude), parseFloat(place.longitude)];

    console.log(`Zipcode ${zipcode} validated: ${coords}`);

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
    console.error('Zipcode lookup error:', error.message);
    if (error.message === 'Zipcode not found') {
      res.status(400).json({ error: 'Zipcode not found' });
    } else {
      res.status(500).json({ error: 'Zipcode lookup failed' });
    }
  }
});

// Auth routes
app.post('/api/register', async (req, res) => {
  try {
    const { username, email, password, zipcode, pronouns, bio } = req.body;
    if (users.find(u => u.username === username)) {
      return res.status(400).json({ error: 'Username already exists' });
    }
    if (users.find(u => u.email === email)) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = { 
      id: nextUserId++, 
      username, 
      email, 
      passwordHash: hashedPassword, 
      groups: [],
      zipcode: zipcode || '',
      pronouns: pronouns || '',
      bio: bio || '',
      isAdmin: false
    };
    users.push(user);
    res.json({ user: { id: user.id, username: user.username, email: user.email, zipcode: user.zipcode, pronouns: user.pronouns, bio: user.bio } });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username);
    if (!user || !await bcrypt.compare(password, user.passwordHash)) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ userId: user.id, username: user.username, email: user.email, isAdmin: user.isAdmin }, JWT_SECRET);
    res.json({ token, user: { id: user.id, username: user.username, email: user.email, zipcode: user.zipcode, pronouns: user.pronouns, bio: user.bio, isAdmin: user.isAdmin } });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Profile routes
app.get('/api/profile/:userId', auth, (req, res) => {
  try {
    const user = users.find(u => u.id == req.params.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ id: user.id, username: user.username, email: user.email, zipcode: user.zipcode, pronouns: user.pronouns, bio: user.bio });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/profile', auth, (req, res) => {
  try {
    const { zipcode, pronouns, bio } = req.body;
    const user = users.find(u => u.id === req.user.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    user.zipcode = zipcode || user.zipcode;
    user.pronouns = pronouns || user.pronouns;
    user.bio = bio || user.bio;
    
    res.json({ id: user.id, username: user.username, email: user.email, zipcode: user.zipcode, pronouns: user.pronouns, bio: user.bio });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Admin routes
app.get('/api/admin/users', auth, adminAuth, (req, res) => {
  try {
    const userList = users.map(u => ({
      id: u.id,
      username: u.username,
      email: u.email,
      zipcode: u.zipcode,
      pronouns: u.pronouns,
      bio: u.bio,
      isAdmin: u.isAdmin,
      groups: u.groups
    }));
    res.json(userList);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/admin/users/:userId', auth, adminAuth, (req, res) => {
  try {
    const { username, email, zipcode, pronouns, bio, isAdmin } = req.body;
    const user = users.find(u => u.id == req.params.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    user.username = username || user.username;
    user.email = email || user.email;
    user.zipcode = zipcode || user.zipcode;
    user.pronouns = pronouns || user.pronouns;
    user.bio = bio || user.bio;
    user.isAdmin = isAdmin !== undefined ? isAdmin : user.isAdmin;
    
    res.json({ id: user.id, username: user.username, email: user.email, zipcode: user.zipcode, pronouns: user.pronouns, bio: user.bio, isAdmin: user.isAdmin });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/admin/users/:userId', auth, adminAuth, (req, res) => {
  try {
    const userIndex = users.findIndex(u => u.id == req.params.userId);
    if (userIndex === -1) return res.status(404).json({ error: 'User not found' });
    
    users.splice(userIndex, 1);
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/admin/messages', auth, adminAuth, (req, res) => {
  try {
    res.json(messages);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/admin/messages/:messageId', auth, adminAuth, (req, res) => {
  try {
    const messageIndex = messages.findIndex(m => m.id == req.params.messageId);
    if (messageIndex === -1) return res.status(404).json({ error: 'Message not found' });
    
    messages.splice(messageIndex, 1);
    res.json({ message: 'Message deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/admin/reset', auth, adminAuth, (req, res) => {
  try {
    resetAndCreateAdmin();
    res.json({ message: 'Server data reset complete' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Group routes
app.get('/api/groups', auth, (req, res) => {
  try {
    const user = users.find(u => u.id === req.user.userId);
    const userGroups = groups.filter(g => user.groups.includes(g._id));
    res.json(userGroups);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/groups/discover', auth, (req, res) => {
  try {
    const user = users.find(u => u.id === req.user.userId);
    const userZip = user.zipcode;
    const userGroups = user.groups;
    
    // Filter out groups user is already in
    const availableGroups = groups.filter(g => !userGroups.includes(g._id));
    
    let nearbyGroups = [];
    let popularGroups = [];
    
    if (userZip) {
      // Groups with zipcodes, sorted by distance (simplified - same zip first)
      nearbyGroups = availableGroups
        .filter(g => g.zipcode)
        .sort((a, b) => {
          if (a.zipcode === userZip && b.zipcode !== userZip) return -1;
          if (b.zipcode === userZip && a.zipcode !== userZip) return 1;
          return 0;
        })
        .slice(0, 10);
    }
    
    // Popular groups without zipcodes, sorted by member count
    popularGroups = availableGroups
      .filter(g => !g.zipcode)
      .sort((a, b) => b.members.length - a.members.length)
      .slice(0, 10);
    
    res.json({ nearbyGroups, popularGroups });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/groups/all', (req, res) => {
  res.json(groups);
});

app.post('/api/groups', auth, (req, res) => {
  try {
    const { name, description, zipcode } = req.body;
    if (groups.find(g => g.name === name)) {
      return res.status(400).json({ error: 'Group already exists' });
    }
    const group = { 
      _id: nextGroupId++, 
      name, 
      description: description || '',
      zipcode: zipcode || '',
      members: [req.user.userId] 
    };
    groups.push(group);
    const user = users.find(u => u.id === req.user.userId);
    user.groups.push(group._id);
    res.json(group);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/groups/join', auth, (req, res) => {
  try {
    const { groupId } = req.body;
    const group = groups.find(g => g._id === groupId);
    if (!group) return res.status(404).json({ error: 'Group not found' });
    if (!group.members.includes(req.user.userId)) {
      group.members.push(req.user.userId);
    }
    const user = users.find(u => u.id === req.user.userId);
    if (!user.groups.includes(groupId)) {
      user.groups.push(groupId);
    }
    res.json(group);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/groups/leave', auth, (req, res) => {
  try {
    const { groupId } = req.body;
    const group = groups.find(g => g._id === groupId);
    if (!group) return res.status(404).json({ error: 'Group not found' });
    
    group.members = group.members.filter(id => id !== req.user.userId);
    const user = users.find(u => u.id === req.user.userId);
    user.groups = user.groups.filter(id => id !== groupId);
    
    res.json({ message: 'Left group successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Chat routes
app.get('/api/groups/:groupId/messages', auth, (req, res) => {
  try {
    const groupMessages = messages
      .filter(m => m.groupId == req.params.groupId)
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
      .slice(-50);
    res.json(groupMessages);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Socket.io for real-time chat
io.on('connection', (socket) => {
  socket.on('join-group', (groupId) => {
    socket.join(groupId);
  });

  socket.on('send-message', (data) => {
    try {
      const message = {
        id: nextMessageId++,
        ...data,
        timestamp: new Date().toISOString()
      };
      messages.push(message);
      io.to(data.groupId).emit('new-message', message);
    } catch (err) {
      console.error('Message save error:', err);
    }
  });
});

// POST new activity
app.post('/api/activities', (req, res) => {
  try {
    const { groupName, activityType, description, contact, location } = req.body;

    if (!groupName || !activityType || !location) {
      console.log('Missing required fields for activity');
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!contact || !contact.email) {
      console.log('Missing contact email for activity');
      return res.status(400).json({ error: 'Contact email is required' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contact.email)) {
      console.log('Invalid email format for activity');
      return res.status(400).json({ error: 'Invalid email format' });
    }

    const newActivity = {
      id: nextId++,
      groupName,
      activityType,
      description,
      contact,
      location,
      timestamp: new Date().toISOString()
    };

    activities.unshift(newActivity);
    console.log(`Activity saved: ${newActivity.id}, ${groupName}, ${activityType}`);

    // --- Markdown Logging ---
    const mdEntry = `
## Activity #${newActivity.id}: ${groupName}

- **Type:** ${activityType}
- **Description:** ${description}
- **Contact:** ${contact.email}${contact.phone ? `, ${contact.phone}` : ''}
- **Location:** ${location.city}, ${location.state} ${location.zipcode}
- **Timestamp:** ${newActivity.timestamp}

---
`;

    fs.appendFile('activity-log.md', mdEntry, (err) => {
      if (err) {
        console.error('Failed to write activity to log file:', err);
      }
    });
    // --- End Markdown Logging ---

    res.json(newActivity);
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Serve React build files
app.use(express.static(path.join(__dirname, 'build')));
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    res.status(404).json({ error: 'API endpoint not found' });
  } else {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
  }
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});