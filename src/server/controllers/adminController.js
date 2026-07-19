import db from '../db.js';

export function getDashboardStats(req, res) {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const users = db.getUsers();
    const doctors = db.getDoctors();
    const appointments = db.getAppointments();

    const patientCount = users.filter((u) => u.role === 'patient').length;
    const doctorCount = doctors.length;
    const approvedDoctorCount = doctors.filter((d) => d.isApproved).length;
    const pendingApprovalCount = doctors.filter((d) => !d.isApproved).length;

    const totalAppointments = appointments.length;
    const completedAppointments = appointments.filter((a) => a.status === 'completed').length;
    const confirmedAppointments = appointments.filter((a) => a.status === 'confirmed').length;
    const pendingAppointments = appointments.filter((a) => a.status === 'pending').length;
    const cancelledAppointments = appointments.filter((a) => a.status === 'cancelled').length;

    // Calculate estimated platform revenue based on completed and confirmed consultation fees
    let totalRevenue = 0;
    appointments.forEach((apt) => {
      if (apt.status === 'completed' || apt.status === 'confirmed') {
        const doc = doctors.find((d) => d.userId === apt.doctorId);
        if (doc) {
          totalRevenue += doc.consultationFee;
        }
      }
    });

    return res.json({
      patientCount,
      doctorCount,
      approvedDoctorCount,
      pendingApprovalCount,
      totalAppointments,
      completedAppointments,
      confirmedAppointments,
      pendingAppointments,
      cancelledAppointments,
      totalRevenue,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to retrieve admin statistics', error: error.message });
  }
}

export function getAllUsers(req, res) {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const users = db.getUsers().map((u) => {
      const copy = { ...u };
      delete copy.password;
      return copy;
    });

    return res.json(users);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to retrieve users list', error: error.message });
  }
}

export function getAllDoctors(req, res) {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    return res.json(db.getDoctors());
  } catch (error) {
    return res.status(500).json({ message: 'Failed to retrieve doctors list', error: error.message });
  }
}

export function approveDoctor(req, res) {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { userId } = req.params;
    const doctor = db.findDoctorById(userId);

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    const updated = db.updateDoctor(userId, { isApproved: true });

    // Mark the isdoctor flag on corresponding user
    db.updateUser(userId, { isdoctor: true });

    return res.json({
      message: `Dr. ${doctor.name} has been approved successfully.`,
      doctor: updated,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to approve doctor', error: error.message });
  }
}

export function toggleUserStatus(req, res) {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { userId } = req.params;
    const user = db.findUserById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.id === req.user.id) {
      return res.status(400).json({ message: 'You cannot suspend your own administrator account' });
    }

    const newStatus = user.status === 'active' ? 'suspended' : 'active';
    const updated = db.updateUser(userId, { status: newStatus });

    return res.json({
      message: `User ${user.name} is now ${newStatus}`,
      user: updated,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to toggle user status', error: error.message });
  }
}

export function getAllAppointmentsAdmin(req, res) {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const appointments = db.getAppointments()
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return res.json(appointments);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to retrieve all appointments', error: error.message });
  }
}
