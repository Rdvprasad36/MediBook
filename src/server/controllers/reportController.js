import db from '../db.js';

export function uploadReport(req, res) {
  try {
    if (!req.user || req.user.role !== 'patient') {
      return res.status(403).json({ message: 'Only patients can upload medical reports' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded or invalid file format' });
    }

    const { description, doctorId } = req.body;

    let doctorName = '';
    if (doctorId) {
      const doc = db.findDoctorById(doctorId);
      if (doc) {
        doctorName = doc.name;
      }
    }

    const reportId = `report_${Date.now()}_${Math.round(Math.random() * 1000)}`;

    const newReport = {
      id: reportId,
      patientId: req.user.id,
      patientName: req.user.name,
      fileName: req.file.originalname,
      filePath: `/uploads/${req.file.filename}`,
      fileSize: `${(req.file.size / (1024 * 1024)).toFixed(2)} MB`,
      uploadedAt: new Date().toISOString(),
      description: description || 'No description provided',
      doctorId: doctorId || undefined,
      doctorName: doctorName || undefined,
    };

    db.insertReport(newReport);

    const { appointmentId } = req.body;
    if (appointmentId) {
      const apt = db.findAppointmentById(appointmentId);
      if (apt && apt.patientId === req.user.id) {
        const updatedReports = [...(apt.medicalReports || []), newReport];
        db.updateAppointment(appointmentId, { medicalReports: updatedReports });
      }
    }

    return res.status(201).json({
      message: 'Medical report uploaded successfully',
      report: newReport,
    });
  } catch (error) {
    console.error('Upload report error:', error);
    return res.status(500).json({ message: 'Failed to upload report', error: error.message });
  }
}

export function getPatientReports(req, res) {
  try {
    if (!req.user || req.user.role !== 'patient') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const reports = db.getReports()
      .filter((r) => r.patientId === req.user.id)
      .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());

    return res.json(reports);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to retrieve reports', error: error.message });
  }
}

export function getDoctorPatientReports(req, res) {
  try {
    if (!req.user || req.user.role !== 'doctor') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const appointments = db.getAppointments().filter((a) => a.doctorId === req.user.id);
    const patientIds = new Set(appointments.map((a) => a.patientId));

    const reports = db.getReports()
      .filter((r) => r.doctorId === req.user.id || patientIds.has(r.patientId))
      .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());

    return res.json(reports);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to retrieve medical reports', error: error.message });
  }
}

export function deleteReport(req, res) {
  try {
    if (!req.user || req.user.role !== 'patient') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { id } = req.params;
    const reports = db.getReports();
    const report = reports.find((r) => r.id === id);

    if (!report) {
      return res.status(404).json({ message: 'Medical report not found' });
    }

    if (report.patientId !== req.user.id) {
      return res.status(403).json({ message: 'You cannot delete another patient\'s report' });
    }

    const appointments = db.getAppointments().filter((a) => a.patientId === req.user.id);
    appointments.forEach((apt) => {
      const filtered = apt.medicalReports.filter((r) => r.id !== id);
      if (filtered.length !== apt.medicalReports.length) {
        db.updateAppointment(apt.id, { medicalReports: filtered });
      }
    });

    db.deleteReport(id);

    return res.json({ message: 'Medical report deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete report', error: error.message });
  }
}
