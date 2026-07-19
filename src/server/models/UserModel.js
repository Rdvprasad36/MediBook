import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    set: function(val) {
      if (typeof val !== 'string' || !val) return val;
      return val.charAt(0).toUpperCase() + val.slice(1);
    }
  },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  role: { type: String, default: 'patient', enum: ['patient', 'doctor', 'admin'] },
  isdoctor: { type: Boolean, default: false },
  status: { type: String, default: 'active', enum: ['active', 'suspended'] },
  notification: { type: Array, default: [] },
  seennotification: { type: Array, default: [] }
}, { timestamps: true });

export const User = mongoose.models.user || mongoose.model('user', userSchema);
export default User;
