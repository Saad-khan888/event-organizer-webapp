import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    required: true, 
    enum: ['organizer', 'athlete', 'reporter', 'viewer'] 
  },
  firstName: String,
  lastName: String,
  bio: String,
  avatar: String,
  address: String,
  contact: String,
  website: String,
  profilePicture: String,
  companyName: String,
  organization: String,
  category: String,
  previousVictories: String,
  socialMedia: String,
  achievements: String,
  mediaOrganization: String,
  reporterCategory: String,
  experience: String
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Add virtual 'id' field that maps to '_id'
userSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model('User', userSchema);
