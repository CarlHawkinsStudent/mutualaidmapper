# Deployment Guide - Mutual Aid Mapper

## Quick Deploy Options

### Option 1: Render (Recommended - Free)

**Frontend + Backend together:**

1. Push code to GitHub
2. Go to [render.com](https://render.com) and sign up
3. Click "New Web Service"
4. Connect your GitHub repo
5. Use these settings:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `node server.js`
   - **Environment**: Node
6. Add environment variable: `NODE_ENV=production`
7. Deploy - your app will be live at `https://yourapp.onrender.com`

### Option 2: Railway (Free tier)

1. Push to GitHub
2. Go to [railway.app](https://railway.app)
3. "Deploy from GitHub"
4. Select your repo
5. Railway auto-detects Node.js and deploys
6. Live at `https://yourapp.up.railway.app`

### Option 3: Heroku (Paid)

1. Install Heroku CLI
2. `heroku create your-app-name`
3. `git push heroku main`
4. `heroku open`

## Production Setup

### 1. Update package.json
Add production script:
```json
"scripts": {
  "start": "node server.js",
  "dev": "concurrently \"npm run server\" \"npm start\"",
  "build": "react-scripts build",
  "heroku-postbuild": "npm run build"
}
```

### 2. Update server.js
Add this to serve React build:
```javascript
// Add after other middleware
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('build'));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
  });
}
```

### 3. Environment Variables
Set these on your hosting platform:
- `NODE_ENV=production`
- `PORT=5000` (or let platform set it)

## Custom Domain (Optional)

1. Buy domain from Namecheap/GoDaddy
2. In hosting platform settings, add custom domain
3. Update DNS records as instructed
4. Enable SSL (usually automatic)

## Database Upgrade (Optional)

For persistent data, replace in-memory storage:

**MongoDB Atlas (Free):**
1. Create account at [mongodb.com/atlas](https://mongodb.com/atlas)
2. Create free cluster
3. Add connection string to environment variables
4. Update server.js to use MongoDB instead of array

**PostgreSQL on Render:**
1. Add PostgreSQL service in Render
2. Connect to your web service
3. Update server.js for PostgreSQL

## Cost Breakdown

- **Free Options**: Render, Railway (with limits)
- **Domain**: $10-15/year
- **Database**: Free tier available
- **Total**: $0-15/year for basic setup

## Go Live Checklist

- [ ] Code pushed to GitHub
- [ ] Hosting platform connected
- [ ] Environment variables set
- [ ] Build successful
- [ ] App accessible via URL
- [ ] Forms submit correctly
- [ ] Map displays properly
- [ ] Dark mode works

Your mutual aid mapper will be live and ready for community use!