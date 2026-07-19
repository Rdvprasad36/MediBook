import db from '../db.js';

export function bookAppointment(req, res) {
  try {
    if (!req.user || req.user.role !== 'patient') {
      return res.status(403).json({ message: 'Only patients can book appointments' });
    }

    const { doctorId, date, timeSlot, reason } = req.body;

    if (!doctorId || !date || !timeSlot || !reason) {
      return res.status(400).json({ message: 'Doctor ID, date, time slot, and reason are required' });
    }

    const doctor = db.findDoctorById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    if (!doctor.isApproved) {
      return res.status(400).json({ message: 'This doctor is not currently accepting appointments' });
    }

    // Check if the slot is valid for this doctor's availability
    const dateObj = new Date(date);
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayOfWeek = days[dateObj.getDay()];

    const availableSlots = doctor.availability[dayOfWeek] || [];
    if (!availableSlots.includes(timeSlot)) {
      return res.status(400).json({ message: `Doctor is not available at ${timeSlot} on ${dayOfWeek}` });
    }

    // Check for double booking
    const existingApts = db.findAppointments({ doctorId, date, timeSlot });
    const isBooked = existingApts.some(
      (a) => a.status === 'confirmed' || a.status === 'pending'
    );

    if (isBooked) {
      return res.status(400).json({ message: 'This time slot has already been booked' });
    }

    // Check if the patient already has an appointment at the same day and time
    const patientApts = db.getAppointments().filter(
      (a) => a.patientId === req.user.id && a.date === date && a.timeSlot === timeSlot && a.status !== 'cancelled'
    );
    if (patientApts.length > 0) {
      return res.status(400).json({ message: 'You already have another appointment booked at this time' });
    }

    const aptId = `apt_${Date.now()}_${Math.round(Math.random() * 1000)}`;

    const newApt = {
      id: aptId,
      patientId: req.user.id,
      patientName: req.user.name,
      patientPhone: req.user.phone,
      doctorId: doctor.userId,
      doctorName: doctor.name,
      doctorSpecialization: doctor.specialization,
      date,
      timeSlot,
      status: 'pending',
      reason,
      medicalReports: [],
      createdAt: new Date().toISOString(),
    };

    db.insertAppointment(newApt);

    // Add a notification to the doctor's user account
    const doctorUser = db.findUserById(doctor.userId);
    if (doctorUser) {
      const notificationMessage = `New appointment request from ${req.user.name} for ${date} at ${timeSlot}.`;
      const notifId = `notif_${Date.now()}_${Math.round(Math.random() * 1000)}`;
      const notif = { id: notifId, message: notificationMessage, read: false, createdAt: new Date().toISOString() };
      
      const notification = doctorUser.notification || [];
      notification.push(notif);
      db.updateUser(doctor.userId, { notification });
    }

    return res.status(201).json({
      message: 'Appointment booked successfully. Awaiting doctor confirmation.',
      appointment: newApt,
    });
  } catch (error) {
    console.error('Book appointment error:', error);
    return res.status(500).json({ message: 'Failed to book appointment', error: error.message });
  }
}

export function getPatientAppointments(req, res) {
  try {
    if (!req.user || req.user.role !== 'patient') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const appointments = db.getAppointments()
      .filter((a) => a.patientId === req.user.id)
      .sort((a, b) => new Date(b.date + 'T' + b.timeSlot).getTime() - new Date(a.date + 'T' + a.timeSlot).getTime());

    return res.json(appointments);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to retrieve appointments', error: error.message });
  }
}

export function getDoctorAppointments(req, res) {
  try {
    if (!req.user || req.user.role !== 'doctor') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const appointments = db.getAppointments()
      .filter((a) => a.doctorId === req.user.id)
      .sort((a, b) => new Date(b.date + 'T' + b.timeSlot).getTime() - new Date(a.date + 'T' + a.timeSlot).getTime());

    return res.json(appointments);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to retrieve doctor appointments', error: error.message });
  }
}

export function updateAppointmentStatus(req, res) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const { id } = req.params;
    const { status, date, timeSlot } = req.body;

    const appointment = db.findAppointmentById(id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    const isPatient = req.user.role === 'patient' && appointment.patientId === req.user.id;
    const isDoctor = req.user.role === 'doctor' && appointment.doctorId === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isPatient && !isDoctor && !isAdmin) {
      return res.status(403).json({ message: 'You do not have permission to modify this appointment' });
    }

    const allowedStatuses = ['pending', 'confirmed', 'cancelled', 'completed'];
    if (status && !allowedStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const updateFields = {};

    if (status) {
      if (isPatient && status !== 'cancelled') {
        return res.status(400).json({ message: 'Patients can only cancel appointments' });
      }
      updateFields.status = status;
    }

    if (date || timeSlot) {
      const targetDate = date || appointment.date;
      const targetTime = timeSlot || appointment.timeSlot;

      if (targetDate !== appointment.date || targetTime !== appointment.timeSlot) {
        const doctor = db.findDoctorById(appointment.doctorId);
        if (!doctor) {
          return res.status(404).json({ message: 'Doctor not found' });
        }

        const dateObj = new Date(targetDate);
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const dayOfWeek = days[dateObj.getDay()];
        const availableSlots = doctor.availability[dayOfWeek] || [];

        if (!availableSlots.includes(targetTime)) {
          return res.status(400).json({ message: `Doctor is not available at ${targetTime} on ${dayOfWeek}` });
        }

        const existingApts = db.findAppointments({ doctorId: appointment.doctorId, date: targetDate, timeSlot: targetTime });
        const isBooked = existingApts.some(
          (a) => a.id !== appointment.id && (a.status === 'confirmed' || a.status === 'pending')
        );

        if (isBooked) {
          return res.status(400).json({ message: 'The requested time slot has already been booked by another patient' });
        }

        updateFields.date = targetDate;
        updateFields.timeSlot = targetTime;
        
        if (isPatient) {
          updateFields.status = 'pending';
        }
      }
    }

    const updatedApt = db.updateAppointment(id, updateFields);

    // Notify patient of any status change or reschedule if updated by Doctor
    if (isDoctor || isAdmin) {
      const patientUser = db.findUserById(appointment.patientId);
      if (patientUser) {
        let notificationMessage = `Your appointment with ${appointment.doctorName} on ${updatedApt.date} has been updated to status: ${updatedApt.status}.`;
        if (date || timeSlot) {
          notificationMessage = `Your appointment with ${appointment.doctorName} has been rescheduled to ${updatedApt.date} at ${updatedApt.timeSlot}.`;
        }
        const notifId = `notif_${Date.now()}_${Math.round(Math.random() * 1000)}`;
        const notif = { id: notifId, message: notificationMessage, read: false, createdAt: new Date().toISOString() };
        
        const notification = patientUser.notification || [];
        notification.push(notif);
        db.updateUser(appointment.patientId, { notification });
      }
    }

    return res.json({
      message: 'Appointment updated successfully',
      appointment: updatedApt,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update appointment', error: error.message });
  }
}

export function addPrescription(req, res) {
  try {
    if (!req.user || req.user.role !== 'doctor') {
      return res.status(403).json({ message: 'Only doctors can issue prescriptions' });
    }

    const { id } = req.params;
    const { medications, instructions, notes } = req.body;

    if (!medications || !instructions) {
      return res.status(400).json({ message: 'Medications and instructions are required' });
    }

    const appointment = db.findAppointmentById(id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    if (appointment.doctorId !== req.user.id) {
      return res.status(403).json({ message: 'You cannot issue prescriptions for another doctor\'s appointment' });
    }

    const updatedApt = db.updateAppointment(id, {
      status: 'completed',
      prescription: {
        medications,
        instructions,
        notes: notes || '',
        updatedAt: new Date().toISOString(),
      },
    });

    // Notify patient
    const patientUser = db.findUserById(appointment.patientId);
    if (patientUser) {
      const notificationMessage = `Dr. ${appointment.doctorName} has issued a prescription for your appointment on ${appointment.date}.`;
      const notifId = `notif_${Date.now()}_${Math.round(Math.random() * 1000)}`;
      const notif = { id: notifId, message: notificationMessage, read: false, createdAt: new Date().toISOString() };
      
      const notification = patientUser.notification || [];
      notification.push(notif);
      db.updateUser(appointment.patientId, { notification });
    }

    return res.json({
      message: 'Prescription added and appointment marked as completed',
      appointment: updatedApt,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to add prescription', error: error.message });
  }
}
