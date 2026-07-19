import express from 'express';
import { updateProfile } from '../controllers/authController.js';
import { updateAvailability } from '../controllers/doctorController.js';
import { getDoctorAppointments, updateAppointmentStatus, addPrescription } from '../controllers/appointmentController.js';
import { getDoctorPatientReports } from '../controllers/reportController.js';
import { authenticate, authorize } from '../middleware/AuthMiddleware.js';

const router = express.Router();

// --- Profile & Availability ---
router.post('/updateprofile', authenticate, authorize(['doctor']), updateProfile);
router.put('/updateavailability', authenticate, authorize(['doctor']), updateAvailability);

// --- Appointments Management ---
router.get('/getdoctorappointments', authenticate, authorize(['doctor']), getDoctorAppointments);
router.post('/handlestatus/:id', authenticate, authorize(['doctor']), updateAppointmentStatus);
router.post('/addprescription/:id', authenticate, authorize(['doctor']), addPrescription);

// --- Secure Vault Documents ---
router.get('/getdoctorpatientreports', authenticate, authorize(['doctor']), getDoctorPatientReports);

export default router;
