import express from 'express';
import { register, login, getCurrentUser, updateProfile } from '../controllers/authController.js';
import { getApprovedDoctors, getDoctorById, getSpecializations, updateAvailability } from '../controllers/doctorController.js';
import { bookAppointment, getPatientAppointments, getDoctorAppointments, updateAppointmentStatus, addPrescription } from '../controllers/appointmentController.js';
import { getDashboardStats, getAllUsers, getAllDoctors, approveDoctor, toggleUserStatus, getAllAppointmentsAdmin } from '../controllers/adminController.js';
import { uploadReport, getPatientReports, getDoctorPatientReports, deleteReport } from '../controllers/reportController.js';
import { authenticate, authorize } from '../middleware/AuthMiddleware.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

// --- Public Auth Routes ---
router.post('/auth/register', register);
router.post('/auth/login', login);

// --- Authenticated User Routes ---
router.get('/auth/me', authenticate, getCurrentUser);
router.put('/auth/profile', authenticate, updateProfile);

// --- Doctor Directory Routes (Public or Patient) ---
router.get('/doctors', getApprovedDoctors);
router.get('/doctors/specializations', getSpecializations);
router.get('/doctors/:id', getDoctorById);

// --- Doctor Specific Routes (Doctor role only) ---
router.put('/doctors/availability', authenticate, authorize(['doctor']), updateAvailability);

// --- Appointment Booking & Management Routes ---
router.post('/appointments', authenticate, authorize(['patient']), bookAppointment);
router.get('/appointments/patient', authenticate, authorize(['patient']), getPatientAppointments);
router.get('/appointments/doctor', authenticate, authorize(['doctor']), getDoctorAppointments);
router.put('/appointments/:id/status', authenticate, updateAppointmentStatus);
router.post('/appointments/:id/prescription', authenticate, authorize(['doctor']), addPrescription);

// --- Medical Report Secure Upload/Retrieval Routes ---
router.post('/reports', authenticate, authorize(['patient']), upload.single('report'), uploadReport);
router.get('/reports/patient', authenticate, authorize(['patient']), getPatientReports);
router.get('/reports/doctor', authenticate, authorize(['doctor']), getDoctorPatientReports);
router.delete('/reports/:id', authenticate, authorize(['patient']), deleteReport);

// --- Administrative Dashboard & Control Routes ---
router.get('/admin/stats', authenticate, authorize(['admin']), getDashboardStats);
router.get('/admin/users', authenticate, authorize(['admin']), getAllUsers);
router.get('/admin/doctors', authenticate, authorize(['admin']), getAllDoctors);
router.put('/admin/doctors/:userId/approve', authenticate, authorize(['admin']), approveDoctor);
router.put('/admin/users/:userId/toggle-status', authenticate, authorize(['admin']), toggleUserStatus);
router.get('/admin/appointments', authenticate, authorize(['admin']), getAllAppointmentsAdmin);

export default router;
