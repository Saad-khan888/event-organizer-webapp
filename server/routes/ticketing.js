import express from 'express';
import crypto from 'crypto';
import { TicketType, PaymentMethod, Order, Ticket, TicketValidation } from '../models/Ticket.js';
import Event from '../models/Event.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// ==================== TICKET TYPES ====================

// Get ticket types for an event
router.get('/events/:eventId/ticket-types', async (req, res) => {
  try {
    const ticketTypes = await TicketType.find({ 
      event: req.params.eventId,
      is_active: true 
    }).sort({ createdAt: 1 });
    res.json(ticketTypes);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Create ticket type (organizers only)
router.post('/events/:eventId/ticket-types', authenticate, authorize('organizer'), async (req, res) => {
  try {
    // Verify event exists and user is organizer
    const event = await Event.findById(req.params.eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    if (event.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const ticketType = new TicketType({
      ...req.body,
      event: req.params.eventId
    });
    await ticketType.save();
    res.status(201).json(ticketType);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update ticket type
router.put('/ticket-types/:id', authenticate, authorize('organizer'), async (req, res) => {
  try {
    const ticketType = await TicketType.findById(req.params.id).populate('event');
    if (!ticketType) {
      return res.status(404).json({ error: 'Ticket type not found' });
    }

    if (ticketType.event.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    Object.assign(ticketType, req.body);
    await ticketType.save();
    res.json(ticketType);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete ticket type
router.delete('/ticket-types/:id', authenticate, authorize('organizer'), async (req, res) => {
  try {
    const ticketType = await TicketType.findById(req.params.id).populate('event');
    if (!ticketType) {
      return res.status(404).json({ error: 'Ticket type not found' });
    }

    if (ticketType.event.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await ticketType.deleteOne();
    res.json({ success: true, message: 'Ticket type deleted' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ==================== PAYMENT METHODS ====================

// Get payment methods for an event
router.get('/events/:eventId/payment-methods', async (req, res) => {
  try {
    const methods = await PaymentMethod.find({ 
      event: req.params.eventId,
      is_active: true 
    }).sort({ display_order: 1 });
    res.json(methods);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Create payment method (organizers only)
router.post('/events/:eventId/payment-methods', authenticate, authorize('organizer'), async (req, res) => {
  try {
    // Verify event exists and user is organizer
    const event = await Event.findById(req.params.eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    if (event.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const method = new PaymentMethod({
      ...req.body,
      event: req.params.eventId,
      organizer: req.user._id
    });
    await method.save();
    res.status(201).json(method);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update payment method
router.put('/payment-methods/:id', authenticate, authorize('organizer'), async (req, res) => {
  try {
    const method = await PaymentMethod.findById(req.params.id).populate('event');
    if (!method) {
      return res.status(404).json({ error: 'Payment method not found' });
    }

    if (method.event.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    Object.assign(method, req.body);
    await method.save();
    res.json(method);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete payment method
router.delete('/payment-methods/:id', authenticate, authorize('organizer'), async (req, res) => {
  try {
    const method = await PaymentMethod.findById(req.params.id).populate('event');
    if (!method) {
      return res.status(404).json({ error: 'Payment method not found' });
    }

    if (method.event.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await method.deleteOne();
    res.json({ success: true, message: 'Payment method deleted' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ==================== ORDERS ====================

// Get user's orders
router.get('/my-orders', authenticate, async (req, res) => {
  try {
    let orders;
    
    // If user is an organizer, fetch orders for all their events
    if (req.user.role === 'organizer') {
      // Find all events organized by this user
      const events = await Event.find({ organizer: req.user._id }).select('_id');
      const eventIds = events.map(e => e._id);
      
      // Find all orders for these events
      orders = await Order.find({ event: { $in: eventIds } })
        .populate('user', 'firstName lastName email')
        .populate('event', 'title date location')
        .populate('ticket_type', 'name price')
        .populate('payment_method', 'name type')
        .sort({ createdAt: -1 });
    } else {
      // For regular users, fetch their own orders
      orders = await Order.find({ user: req.user._id })
        .populate('event', 'title date location')
        .populate('ticket_type', 'name price')
        .populate('payment_method', 'name type')
        .sort({ createdAt: -1 });
    }
    
    res.json(orders);
  } catch (error) {
    console.error('Error in /my-orders:', error);
    res.status(400).json({ error: error.message });
  }
});

// Get orders for an event (organizers only)
router.get('/events/:eventId/orders', authenticate, authorize('organizer'), async (req, res) => {
  try {
    const event = await Event.findOne({ _id: req.params.eventId, organizer: req.user._id });
    if (!event) {
      return res.status(404).json({ error: 'Event not found or unauthorized' });
    }

    const orders = await Order.find({ event: req.params.eventId })
      .populate('user', 'firstName lastName email')
      .populate('ticket_type', 'name price')
      .populate('payment_method', 'name type')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Create order
router.post('/orders', authenticate, async (req, res) => {
  try {
    const { event_id, ticket_type_id, payment_method_id, quantity } = req.body;

    // Get ticket type and check availability
    const ticketType = await TicketType.findById(ticket_type_id);
    if (!ticketType) {
      return res.status(404).json({ error: 'Ticket type not found' });
    }

    if (ticketType.available_quantity < quantity) {
      return res.status(400).json({ error: `Only ${ticketType.available_quantity} tickets available` });
    }

    // Calculate total
    const total_amount = ticketType.price * quantity;

    // Create order
    const order = new Order({
      user: req.user._id,
      event: event_id,
      ticket_type: ticket_type_id,
      payment_method: payment_method_id,
      quantity,
      total_amount,
      status: 'pending_payment'
    });
    await order.save();

    // Update sold count
    ticketType.sold_count += quantity;
    await ticketType.save();

    await order.populate('ticket_type payment_method');
    res.status(201).json(order);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Submit payment proof
router.post('/orders/:orderId/submit-payment', authenticate, async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.orderId, user: req.user._id });
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.status !== 'pending_payment') {
      return res.status(400).json({ error: 'Order is not in pending_payment status' });
    }

    order.payment_details = req.body.payment_details || {};
    order.payment_proof_url = req.body.payment_proof_url;
    order.status = 'pending_verification';
    await order.save();

    res.json({ success: true, message: 'Payment proof submitted' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Approve payment (organizers only)
router.post('/orders/:orderId/approve', authenticate, authorize('organizer'), async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId).populate('event');
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.event.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    if (order.status !== 'pending_verification') {
      return res.status(400).json({ error: 'Order is not pending verification' });
    }

    // Update order status
    order.status = 'paid';
    await order.save();

    // Generate tickets
    const tickets = [];
    for (let i = 0; i < order.quantity; i++) {
      const qr_code = crypto.randomBytes(32).toString('hex');
      const ticket = new Ticket({
        order: order._id,
        user: order.user,
        event: order.event._id,
        ticket_type: order.ticket_type,
        qr_code,
        status: 'active'
      });
      await ticket.save();
      tickets.push(ticket);
    }

    res.json({ success: true, message: 'Payment approved', tickets_generated: tickets.length });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Reject payment (organizers only)
router.post('/orders/:orderId/reject', authenticate, authorize('organizer'), async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId).populate('event ticket_type');
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.event.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    if (order.status !== 'pending_verification') {
      return res.status(400).json({ error: 'Order is not pending verification' });
    }

    // Update order
    order.status = 'rejected';
    order.rejection_reason = req.body.reason || 'Payment verification failed';
    await order.save();

    // Restore ticket availability
    const ticketType = await TicketType.findById(order.ticket_type._id);
    ticketType.sold_count -= order.quantity;
    await ticketType.save();

    res.json({ success: true, message: 'Payment rejected' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ==================== TICKETS ====================

// Get user's tickets
router.get('/my-tickets', authenticate, async (req, res) => {
  try {
    const tickets = await Ticket.find({ user: req.user._id })
      .populate('event', 'title date location')
      .populate('ticket_type', 'name')
      .populate('order', 'total_amount')
      .sort({ createdAt: -1 });
    res.json(tickets);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get tickets for an event (organizers only)
router.get('/events/:eventId/tickets', authenticate, authorize('organizer'), async (req, res) => {
  try {
    const event = await Event.findOne({ _id: req.params.eventId, organizer: req.user._id });
    if (!event) {
      return res.status(404).json({ error: 'Event not found or unauthorized' });
    }

    const tickets = await Ticket.find({ event: req.params.eventId })
      .populate('user', 'firstName lastName email')
      .populate('ticket_type', 'name')
      .sort({ createdAt: -1 });
    res.json(tickets);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Validate ticket (organizers only)
router.post('/tickets/validate', authenticate, authorize('organizer'), async (req, res) => {
  try {
    const { qr_code, event_id } = req.body;

    // Verify organizer owns the event
    const event = await Event.findOne({ _id: event_id, organizer: req.user._id });
    if (!event) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Find ticket by QR code OR by ticket ID
    let ticket = await Ticket.findOne({ qr_code, event: event_id })
      .populate('user', 'firstName lastName email')
      .populate('ticket_type', 'name');

    // If not found by QR code, try by ticket ID
    if (!ticket) {
      ticket = await Ticket.findOne({ _id: qr_code, event: event_id })
        .populate('user', 'firstName lastName email')
        .populate('ticket_type', 'name');
    }

    if (!ticket) {
      await TicketValidation.create({
        event: event_id,
        scanned_by: req.user._id,
        is_valid: false,
        validation_message: 'Ticket not found'
      });
      return res.json({ valid: false, reason: 'not_found', message: 'Ticket not found' });
    }

    if (ticket.status === 'used') {
      await TicketValidation.create({
        ticket: ticket._id,
        event: event_id,
        scanned_by: req.user._id,
        is_valid: false,
        validation_message: 'Already used'
      });
      return res.json({ 
        valid: false, 
        reason: 'already_used', 
        message: 'Ticket already used',
        used_at: ticket.used_at,
        ticket
      });
    }

    if (ticket.status === 'cancelled') {
      await TicketValidation.create({
        ticket: ticket._id,
        event: event_id,
        scanned_by: req.user._id,
        is_valid: false,
        validation_message: 'Ticket cancelled'
      });
      return res.json({ valid: false, reason: 'cancelled', message: 'Ticket cancelled', ticket });
    }

    // Mark as used
    ticket.status = 'used';
    ticket.used_at = new Date();
    await ticket.save();

    await TicketValidation.create({
      ticket: ticket._id,
      event: event_id,
      scanned_by: req.user._id,
      is_valid: true,
      validation_message: 'Valid entry'
    });

    res.json({
      valid: true,
      message: 'Ticket validated successfully',
      ticket: {
        id: ticket.id,
        user: {
          firstName: ticket.user.firstName,
          lastName: ticket.user.lastName,
          email: ticket.user.email
        },
        ticket_type: {
          name: ticket.ticket_type.name
        }
      }
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;