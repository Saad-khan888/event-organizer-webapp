import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  date: { type: Date, required: true },
  time: String,
  location: { type: String, required: true },
  category: String,
  sport: String,
  prize_first: String,
  prize_second: String,
  prize_third: String,
  organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  max_participants: Number,
  status: { 
    type: String, 
    default: 'upcoming',
    enum: ['upcoming', 'ongoing', 'completed', 'cancelled']
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

eventSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

export default mongoose.model('Event', eventSchema);
