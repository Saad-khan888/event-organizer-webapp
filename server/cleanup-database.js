import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables from server/.env
dotenv.config({ path: path.join(path.dirname(fileURLToPath(import.meta.url)), '.env') });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import models
import User from './models/User.js';
import Event from './models/Event.js';
import Report from './models/Report.js';
import { TicketType, PaymentMethod, Order, Ticket, TicketValidation } from './models/Ticket.js';

const cleanupDatabase = async () => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      family: 4,
    });
    console.log('✅ Connected to MongoDB\n');

    // Delete all documents from collections
    console.log('🗑️  Deleting all users...');
    const usersDeleted = await User.deleteMany({});
    console.log(`   ✅ Deleted ${usersDeleted.deletedCount} users`);

    console.log('🗑️  Deleting all events...');
    const eventsDeleted = await Event.deleteMany({});
    console.log(`   ✅ Deleted ${eventsDeleted.deletedCount} events`);

    console.log('🗑️  Deleting all reports...');
    const reportsDeleted = await Report.deleteMany({});
    console.log(`   ✅ Deleted ${reportsDeleted.deletedCount} reports`);

    console.log('🗑️  Deleting all tickets and orders...');
    const ticketsDeleted = await Ticket.deleteMany({});
    console.log(`   ✅ Deleted ${ticketsDeleted.deletedCount} tickets`);
    
    const ordersDeleted = await Order.deleteMany({});
    console.log(`   ✅ Deleted ${ordersDeleted.deletedCount} orders`);
    
    const ticketTypesDeleted = await TicketType.deleteMany({});
    console.log(`   ✅ Deleted ${ticketTypesDeleted.deletedCount} ticket types`);
    
    const paymentMethodsDeleted = await PaymentMethod.deleteMany({});
    console.log(`   ✅ Deleted ${paymentMethodsDeleted.deletedCount} payment methods`);
    
    const validationsDeleted = await TicketValidation.deleteMany({});
    console.log(`   ✅ Deleted ${validationsDeleted.deletedCount} ticket validations`);

    // Clean up uploaded files
    console.log('\n🗑️  Cleaning up uploaded files...');
    
    const uploadFolders = [
      'uploads/avatars',
      'uploads/report-images',
      'uploads/payment-proofs',
      'uploads/event-images'
    ];

    for (const folder of uploadFolders) {
      const folderPath = path.join(__dirname, folder);
      if (fs.existsSync(folderPath)) {
        const files = fs.readdirSync(folderPath);
        let deletedCount = 0;
        
        for (const file of files) {
          const filePath = path.join(folderPath, file);
          if (fs.statSync(filePath).isFile()) {
            fs.unlinkSync(filePath);
            deletedCount++;
          }
        }
        
        console.log(`   ✅ Deleted ${deletedCount} files from ${folder}`);
      }
    }

    console.log('\n✨ Database cleanup completed successfully!');
    console.log('📊 Summary:');
    console.log(`   - Users: ${usersDeleted.deletedCount}`);
    console.log(`   - Events: ${eventsDeleted.deletedCount}`);
    console.log(`   - Reports: ${reportsDeleted.deletedCount}`);
    console.log(`   - Tickets: ${ticketsDeleted.deletedCount}`);
    console.log(`   - Orders: ${ordersDeleted.deletedCount}`);
    console.log(`   - Ticket Types: ${ticketTypesDeleted.deletedCount}`);
    console.log(`   - Payment Methods: ${paymentMethodsDeleted.deletedCount}`);
    console.log(`   - Validations: ${validationsDeleted.deletedCount}`);
    console.log('\n🎉 You can now start fresh!\n');

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed');
    process.exit(0);
  }
};

cleanupDatabase();
