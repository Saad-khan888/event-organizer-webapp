import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/auth.js';
import eventRoutes from './routes/events.js';
import reportRoutes from './routes/reports.js';
import ticketingRoutes from './routes/ticketing.js';
import uploadRoutes from './routes/upload.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Log all requests for debugging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/ticketing', ticketingRoutes);
app.use('/api/upload', uploadRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Database connection with proper options and retry logic
const connectDB = async (retries = 10) => {
  for (let i = 0; i < retries; i++) {
    try {
      await mongoose.connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
        family: 4, // Force IPv4
        maxPoolSize: 10,
        minPoolSize: 2,
      });
      console.log('✅ Connected to MongoDB');
      console.log(`📦 Database: ${mongoose.connection.name}`);
      console.log(`🔗 Connection state: ${mongoose.connection.readyState}`);
      return;
    } catch (error) {
      console.error(`❌ MongoDB connection attempt ${i + 1}/${retries} failed:`, error.message);
      
      if (i < retries - 1) {
        const waitTime = Math.min(3000 * (i + 1), 10000); // Exponential backoff, max 10s
        console.log(`⏳ Retrying in ${waitTime/1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      } else {
        console.error('\n⚠️  Could not connect to MongoDB after multiple attempts.');
        console.error('⚠️  Please ensure MongoDB is running on mongodb://localhost:27017');
        console.error('⚠️  Run "mongod --dbpath mongodb-data" to start MongoDB\n');
        process.exit(1);
      }
    }
  }
};

// Handle MongoDB connection events for better monitoring
mongoose.connection.on('connected', () => {
  console.log('🟢 MongoDB connection established');
});

mongoose.connection.on('disconnected', () => {
  console.log('🔴 MongoDB disconnected - attempting to reconnect...');
});

mongoose.connection.on('reconnected', () => {
  console.log('🟢 MongoDB reconnected successfully');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB error:', err.message);
  // Don't exit on error, let mongoose handle reconnection
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n⚠️  Shutting down gracefully...');
  await mongoose.connection.close();
  console.log('✅ MongoDB connection closed');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n⚠️  Shutting down gracefully...');
  await mongoose.connection.close();
  console.log('✅ MongoDB connection closed');
  process.exit(0);
});

// Start server
const startServer = async () => {
  console.log('🚀 Starting server...');
  
  // Connect to database first
  await connectDB();
  
  // Verify connection is ready
  if (mongoose.connection.readyState !== 1) {
    console.error('❌ MongoDB connection not ready. Exiting...');
    process.exit(1);
  }
  
  const PORT = process.env.PORT || 5001;
  
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log('\n========================================');
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📍 API available at http://localhost:${PORT}/api`);
    console.log(`🗄️  Database: ${mongoose.connection.name}`);
    console.log(`🔗 MongoDB: ${mongoose.connection.host}:${mongoose.connection.port}`);
    console.log('========================================\n');
  });

  // Handle server errors
  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`❌ Port ${PORT} is already in use`);
      console.error('⚠️  Please stop the other process or change the port');
    } else {
      console.error('❌ Server error:', error);
    }
    process.exit(1);
  });

  return server;
};

startServer().catch(err => {
  console.error('❌ Failed to start server:', err);
  process.exit(1);
});
