import express from 'express';
import mongoose from 'mongoose';
import Event from '../models/Event.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Get all events
router.get('/', async (req, res) => {
  try {
    const events = await Event.find()
      .populate('organizer', 'firstName lastName email companyName')
      .populate('participants', 'firstName lastName')
      .sort({ date: -1 });
    
    // Transform to include organizer ID at root level for easier filtering
    const eventsWithOrgId = events.map(event => {
      const eventObj = event.toObject();
      // Ensure _id is a string
      if (eventObj._id) {
        eventObj._id = eventObj._id.toString();
      }
      // Add organizerId for easier filtering
      if (eventObj.organizer && eventObj.organizer._id) {
        eventObj.organizerId = eventObj.organizer._id.toString();
      }
      return eventObj;
    });
    
    res.json(eventsWithOrgId);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get single event
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('organizer', 'firstName lastName email contact')
      .populate('participants', 'firstName lastName avatar');
    
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    res.json(event);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Create event (organizers only)
router.post('/', authenticate, authorize('organizer'), async (req, res) => {
  try {
    const event = new Event({
      ...req.body,
      organizer: req.user._id
    });
    await event.save();
    await event.populate('organizer', 'firstName lastName email companyName');
    
    // Transform to include organizer ID at root level
    const eventObj = event.toObject();
    // Ensure _id is a string
    if (eventObj._id) {
      eventObj._id = eventObj._id.toString();
    }
    // Add organizerId for easier filtering
    if (eventObj.organizer && eventObj.organizer._id) {
      eventObj.organizerId = eventObj.organizer._id.toString();
    }
    
    res.status(201).json(eventObj);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update event
router.put('/:id', authenticate, authorize('organizer'), async (req, res) => {
  try {
    const event = await Event.findOne({ _id: req.params.id, organizer: req.user._id });
    
    if (!event) {
      return res.status(404).json({ error: 'Event not found or unauthorized' });
    }

    Object.assign(event, req.body);
    await event.save();
    await event.populate('organizer', 'firstName lastName email');
    
    res.json(event);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete event
router.delete('/:id', authenticate, authorize('organizer'), async (req, res) => {
  try {
    const event = await Event.findOneAndDelete({ _id: req.params.id, organizer: req.user._id });
    
    if (!event) {
      return res.status(404).json({ error: 'Event not found or unauthorized' });
    }
    
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Join event (athletes and reporters)
router.post('/:id/join', authenticate, authorize('athlete', 'reporter'), async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    console.log('🎯 Join event request:');
    console.log('   Event ID:', req.params.id);
    console.log('   User ID:', req.user._id.toString());
    console.log('   User role:', req.user.role);
    console.log('   User category:', req.user.category);
    console.log('   Event category:', event.category);
    console.log('   Current participants:', event.participants.map(p => p.toString()));

    // CATEGORY RESTRICTION: Athletes and reporters can only join events in their category
    if (req.user.category !== event.category) {
      console.log('❌ Category mismatch - user cannot join this event');
      return res.status(403).json({ 
        error: `You can only join ${req.user.category} events. This is a ${event.category} event.` 
      });
    }

    // Check if user already joined - convert ObjectIds to strings for comparison
    const alreadyJoined = event.participants.some(
      participantId => participantId.toString() === req.user._id.toString()
    );
    
    console.log('   Already joined?', alreadyJoined);
    
    if (alreadyJoined) {
      // Clean up duplicates if any exist
      const uniqueParticipants = [...new Set(event.participants.map(p => p.toString()))];
      if (uniqueParticipants.length !== event.participants.length) {
        console.log('   🧹 Cleaning up duplicate participants');
        event.participants = uniqueParticipants.map(id => new mongoose.Types.ObjectId(id));
        await event.save();
      }
      return res.status(400).json({ error: 'Already joined this event' });
    }

    event.participants.push(req.user._id);
    await event.save();
    await event.populate('participants', 'firstName lastName avatar');
    
    console.log('✅ User joined successfully');
    
    res.json(event);
  } catch (error) {
    console.error('❌ Join event error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Leave event (athletes and reporters)
router.post('/:id/leave', authenticate, authorize('athlete', 'reporter'), async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    console.log('🚪 Leave event request:');
    console.log('   Event ID:', req.params.id);
    console.log('   User ID:', req.user._id.toString());

    // Remove user from participants (handles duplicates too)
    event.participants = event.participants.filter(
      participantId => participantId.toString() !== req.user._id.toString()
    );
    
    await event.save();
    await event.populate('participants', 'firstName lastName avatar');
    
    console.log('✅ User left successfully');
    
    res.json(event);
  } catch (error) {
    console.error('❌ Leave event error:', error);
    res.status(400).json({ error: error.message });
  }
});

export default router;
