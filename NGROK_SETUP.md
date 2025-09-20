# Ngrok Setup Guide

## Quick Setup

### 1. Install ngrok
- Download from [ngrok.com](https://ngrok.com/)
- Or install via npm: `npm install -g ngrok`

### 2. Start the Application
```bash
# Terminal 1: Start the app (both frontend and backend)
npm run dev
```

### 3. Tunnel with ngrok
```bash
# Terminal 2: Create public tunnel (frontend only)
ngrok http 3000
```

### 4. Share the URL
- Copy the `https://` URL from ngrok output
- Share this URL - it's publicly accessible
- Example: `https://abc123.ngrok.io`

## How it Works

- **Frontend**: `localhost:3000` → `https://abc123.ngrok.io`
- **Backend**: `localhost:5000` (proxied through frontend)
- **API Calls**: Frontend proxies `/api/*` requests to backend
- **Single Tunnel**: Only need to tunnel port 3000

## Benefits

- **Instant sharing** - No deployment needed
- **Real domain** - Works on any device/network
- **Local development** - Keep developing while sharing
- **Free tier** - No cost for basic usage

## Usage

1. **Start app**: `npm run dev`
2. **Start tunnel**: `ngrok http 3000`
3. **Share URL**: Give others the ngrok URL
4. **Mobile ready**: API calls automatically proxied to backend

Perfect for demos, testing, and sharing with community members!