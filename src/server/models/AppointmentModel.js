import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  patientId: { type: String, required: true },
  patientName: { type: String, required: true },
  patientPhone: { type: String, required: true },
  doctorId: { type: String, required: true },
  doctorName: { type: String, required: true },
  doctorSpecialization: { type: String, required: true },
  date: { type: String, required: true },
  timeSlot: { type: String, required: true },
  status: { type: String, default: 'pending', enum: ['pending', 'confirmed', 'cancelled', 'completed'] },
  reason: { type: String, default: '' },
  medicalReports: { type: Array, default: [] },
  prescription: { type: Object, default: null },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

export const Appointment = mongoose.models.appointment || mongoose.model('appointment', appointmentSchema);
export default Appointment;
