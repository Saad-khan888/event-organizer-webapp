import mongoose from 'mongoose';

const ticketTypeSchema = new mongoose.Schema({
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  description: String,
  total_quantity: { type: Number, default: 0 },
  sold_count: { type: Number, default: 0 },
  available_quantity: { type: Number, default: 0 },
  sale_start_date: { type: Date, default: Date.now },
  sale_end_date: Date,
  is_active: { type: Boolean, default: true }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

ticketTypeSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

// Auto-calculate available_quantity before save
ticketTypeSchema.pre('save', function(next) {
  this.available_quantity = this.total_quantity - this.sold_count;
  next();
});

const paymentMethodSchema = new mongoose.Schema({
  organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  type: { 
    type: String, 
    required: true,
    enum: ['bank_transfer', 'easypaisa', 'jazzcash', 'cash']
  },
  name: { type: String, required: true },
  account_details: { type: mongoose.Schema.Types.Mixed, default: {} },
  instructions: String,
  is_active: { type: Boolean, default: true },
  display_order: { type: Number, default: 0 }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

paymentMethodSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  ticket_type: { type: mongoose.Schema.Types.ObjectId, ref: 'TicketType', required: true },
  payment_method: { type: mongoose.Schema.Types.ObjectId, ref: 'PaymentMethod' },
  quantity: { type: Number, required: true },
  total_amount: { type: Number, required: true },
  status: { 
    type: String, 
    default: 'pending_payment',
    enum: ['pending_payment', 'pending_verification', 'paid', 'cancelled', 'rejected']
  },
  payment_details: { type: mongoose.Schema.Types.Mixed, default: {} },
  payment_proof_url: String,
  rejection_reason: String
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

orderSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

const ticketSchema = new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  ticket_type: { type: mongoose.Schema.Types.ObjectId, ref: 'TicketType', required: true },
  qr_code: { type: String, required: true, unique: true },
  status: { 
    type: String, 
    default: 'active',
    enum: ['active', 'used', 'cancelled']
  },
  used_at: Date
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

ticketSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

const ticketValidationSchema = new mongoose.Schema({
  ticket: { type: mongoose.Schema.Types.ObjectId, ref: 'Ticket' },
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  scanned_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  is_valid: { type: Boolean, default: false },
  validation_message: String,
  scanned_at: { type: Date, default: Date.now }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

ticketValidationSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

export const TicketType = mongoose.model('TicketType', ticketTypeSchema);
export const PaymentMethod = mongoose.model('PaymentMethod', paymentMethodSchema);
export const Order = mongoose.model('Order', orderSchema);
export const Ticket = mongoose.model('Ticket', ticketSchema);
export const TicketValidation = mongoose.model('TicketValidation', ticketValidationSchema);
