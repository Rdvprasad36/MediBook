import mongoose from 'mongoose';

const doctorSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
  name: { 
    type: String, 
    required: true,
    set: function(val) {
      if (typeof val !== 'string' || !val) return val;
      return val.charAt(0).toUpperCase() + val.slice(1);
    }
  },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  specialization: { type: String, required: true },
  experience: { type: Number, required: true },
  bio: { type: String, default: '' },
  consultationFee: { type: Number, required: true },
  qualifications: { type: String, required: true },
  clinicAddress: { type: String, required: true },
  isApproved: { type: Boolean, default: false },
  rating: { type: Number, default: 0.0 },
  reviewsCount: { type: Number, default: 0 },
  availability: { type: Object, default: {} }
}, { timestamps: true });

export const Doctor = mongoose.models.doctor || mongoose.model('doctor', doctorSchema);
export default Doctor;
