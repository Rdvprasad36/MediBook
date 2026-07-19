import db from '../db.js';

export function getApprovedDoctors(req, res) {
  try {
    const { specialization, search } = req.query;
    let doctors = db.getDoctors().filter((d) => d.isApproved);

    if (specialization && typeof specialization === 'string' && specialization !== 'All') {
      doctors = doctors.filter(
        (d) => d.specialization.toLowerCase() === specialization.toLowerCase()
      );
    }

    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      doctors = doctors.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.specialization.toLowerCase().includes(q) ||
          d.qualifications.toLowerCase().includes(q)
      );
    }

    return res.json(doctors);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to retrieve doctors list', error: error.message });
  }
}

export function getDoctorById(req, res) {
  try {
    const { id } = req.params;
    const doctor = db.findDoctorById(id);

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    return res.json(doctor);
  } catch (error) {
    return res.status(500).json({ message: 'Error retrieving doctor profile', error: error.message });
  }
}

export function getSpecializations(req, res) {
  try {
    const doctors = db.getDoctors().filter((d) => d.isApproved);
    const specs = Array.from(new Set(doctors.map((d) => d.specialization)));
    return res.json(specs);
  } catch (error) {
    return res.status(500).json({ message: 'Error retrieving specializations', error: error.message });
  }
}

export function updateAvailability(req, res) {
  try {
    if (!req.user || req.user.role !== 'doctor') {
      return res.status(403).json({ message: 'Only approved doctors can update availability' });
    }

    const { availability } = req.body;
    if (!availability || typeof availability !== 'object') {
      return res.status(400).json({ message: 'Invalid availability format' });
    }

    const updated = db.updateDoctor(req.user.id, { availability });
    if (!updated) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    return res.json({
      message: 'Availability updated successfully',
      availability: updated.availability,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update availability', error: error.message });
  }
}
