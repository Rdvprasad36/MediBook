import express from 'express';
import { getDashboardStats, getAllUsers, getAllDoctors, approveDoctor, toggleUserStatus, getAllAppointmentsAdmin } from '../controllers/adminController.js';
import { authenticate, authorize } from '../middleware/AuthMiddleware.js';

const router = express.Router();

// --- Platform Core Statistics ---
router.get('/stats', authenticate, authorize(['admin']), getDashboardStats);

// --- User & Doctor Listings ---
router.get('/getallusers', authenticate, authorize(['admin']), getAllUsers);
router.get('/getalldoctors', authenticate, authorize(['admin']), getAllDoctors);

// --- Moderation & Quality Control ---
router.post('/getapprove/:userId', authenticate, authorize(['admin']), approveDoctor);
router.post('/toggle-status/:userId', authenticate, authorize(['admin']), toggleUserStatus);

// --- Global Appointment Overviews ---
router.get('/getallAppointmentsAdmin', authenticate, authorize(['admin']), getAllAppointmentsAdmin);

export default router;
