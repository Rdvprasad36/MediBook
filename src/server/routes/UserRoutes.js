import express from 'express';
import { register, login, getCurrentUser, updateProfile } from '../controllers/authController.js';
import { getApprovedDoctors, getSpecializations, getDoctorById } from '../controllers/doctorController.js';
import { bookAppointment, getPatientAppointments } from '../controllers/appointmentController.js';
import { uploadReport, getPatientReports, deleteReport } from '../controllers/reportController.js';
import { authenticate, authorize } from '../middleware/AuthMiddleware.js';
import { upload } from '../middleware/upload.js';
import db from '../db.js';

const router = express.Router();

// --- Auth Endpoints ---
router.post('/register', register);
router.post('/login', login);
router.post('/getuserdata', authenticate, getCurrentUser);
router.post('/updateprofile', authenticate, updateProfile);

// --- Doctor Directory Endpoints ---
router.get('/getalldoctorsu', getApprovedDoctors);
router.get('/getspecializations', getSpecializations);
router.get('/getdoctor/:id', getDoctorById);

// --- Booking Endpoints ---
router.post('/getappointment', authenticate, authorize(['patient']), bookAppointment);
router.get('/getuserappointments', authenticate, authorize(['patient']), getPatientAppointments);

// --- Medical Report Secure Upload/Retrieval Endpoints ---
// Supports uploading file either with field name 'image' (per technical specification) or 'report'
router.post('/uploadreport', authenticate, authorize(['patient']), upload.single('image'), uploadReport);
router.get('/getpatientreports', authenticate, authorize(['patient']), getPatientReports);
router.delete('/deletereport/:id', authenticate, authorize(['patient']), deleteReport);

// --- Notifications Endpoints ---
router.post('/getallnotification', authenticate, (req, res) => {
  try {
    const user = db.findUserById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const unread = user.notification || [];
    const read = user.seennotification || [];

    // Mark all as read by moving them
    const markedRead = unread.map(n => ({ ...n, read: true }));
    const newRead = [...read, ...markedRead];

    const updated = db.updateUser(req.user.id, {
      notification: [],
      seennotification: newRead
    });

    return res.json({
      message: 'All notifications marked as read',
      user: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        notification: updated.notification,
        seennotification: updated.seennotification
      }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to mark notifications', error: error.message });
  }
});

router.post('/deleteallnotification', authenticate, (req, res) => {
  try {
    const updated = db.updateUser(req.user.id, {
      notification: [],
      seennotification: []
    });

    return res.json({
      message: 'All notifications cleared successfully',
      user: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        notification: updated.notification,
        seennotification: updated.seennotification
      }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete notifications', error: error.message });
  }
});

export default router;
