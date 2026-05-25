# Sports Ecosystem App

A modern web platform connecting Event Organizers, Athletes, and Sports Reporters. Built with the MERN stack (MongoDB Atlas, Express, React, Node.js).

## 🚀 Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) (v16+)

### Installation
```bash
npm install
cd server && npm install && cd ..
```

### Run the App
```bash
start.bat    # Start everything
stop.bat     # Stop everything
```

App opens at **http://localhost:5173**

## ✨ Features

- **Event Management** - Create and manage sports events
- **Ticketing System** - Sell tickets with QR code validation
- **Payment Processing** - Multiple payment methods with verification
- **News & Reports** - Share event coverage and sports news
- **Role-Based Access** - Organizers, Athletes, Reporters, Viewers
- **Cloud Database** - MongoDB Atlas (no local setup needed)

## 🛠️ Tech Stack

- **Frontend**: React + Vite (Port 5173)
- **Backend**: Node.js + Express (Port 5001)
- **Database**: MongoDB Atlas (Cloud)
- **Auth**: JWT
- **Storage**: Local file system

## 📝 Environment Setup

### Frontend (`.env.local`)
```env
VITE_API_URL=http://localhost:5001/api
```

### Backend (`server/.env`)
```env
PORT=5001
MONGODB_URI=mongodb+srv://organizer-app:organizerapp12345@cluster0.hrfhcix.mongodb.net/event-organizer?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=your-secret-key
NODE_ENV=development
```

## 🔌 API Endpoints

### Auth
- `POST /api/auth/signup` - Register
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get profile

### Events
- `GET /api/events` - List events
- `POST /api/events` - Create event

### Ticketing
- `GET /api/ticketing/events/:id/ticket-types`
- `POST /api/ticketing/orders` - Purchase tickets
- `POST /api/ticketing/tickets/validate` - Validate QR code

## 🛑 Troubleshooting

**Backend won't connect?**
- Check internet connection (using cloud database)
- Verify MongoDB Atlas credentials in `server/.env`

**Port already in use?**
- Run `stop.bat` first
- Wait 5 seconds, then run `start.bat`

## 📄 License

MIT License
