import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

class Database {
  constructor() {
    this.data = {
      users: [],
      doctors: [],
      appointments: [],
      reports: [],
    };
    this.init();
  }

  init() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (fs.existsSync(DB_FILE)) {
      try {
        const fileContent = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(fileContent);
      } catch (err) {
        console.error('Failed to parse database file, reinitializing...', err);
        this.seed();
      }
    } else {
      this.seed();
    }
  }

  save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to save database file:', err);
    }
  }

  seed() {
    console.log('Seeding database with rich dummy data...');

    const salt = bcrypt.genSaltSync(10);
    const adminPassword = bcrypt.hashSync('admin123', salt);
    const doctorPassword = bcrypt.hashSync('doctor123', salt);
    const patientPassword = bcrypt.hashSync('patient123', salt);

    // 1. Create Users
    const users = [
      {
        id: 'user_admin',
        email: 'admin@medibook.com',
        password: adminPassword,
        role: 'admin',
        name: 'System Administrator',
        phone: '+91 98765 43210',
        createdAt: new Date().toISOString(),
        status: 'active',
      },
      {
        id: 'user_doc_jenkins',
        email: 'sharma@medibook.com',
        password: doctorPassword,
        role: 'doctor',
        name: 'Dr. Sunita Sharma',
        phone: '+91 98123 45678',
        createdAt: new Date().toISOString(),
        status: 'active',
      },
      {
        id: 'user_doc_chen',
        email: 'mehta@medibook.com',
        password: doctorPassword,
        role: 'doctor',
        name: 'Dr. Rajeev Mehta',
        phone: '+91 98123 78901',
        createdAt: new Date().toISOString(),
        status: 'active',
      },
      {
        id: 'user_doc_ross',
        email: 'iyer@medibook.com',
        password: doctorPassword,
        role: 'doctor',
        name: 'Dr. Ananya Iyer',
        phone: '+91 98123 11111',
        createdAt: new Date().toISOString(),
        status: 'active',
      },
      {
        id: 'user_doc_carter',
        email: 'deshmukh@medibook.com',
        password: doctorPassword,
        role: 'doctor',
        name: 'Dr. Kabir Deshmukh',
        phone: '+91 98123 22222',
        createdAt: new Date().toISOString(),
        status: 'active',
      },
      {
        id: 'user_patient_default',
        email: 'patient@medibook.com',
        password: patientPassword,
        role: 'patient',
        name: 'Aarav Patel',
        phone: '+91 98123 55555',
        createdAt: new Date().toISOString(),
        status: 'active',
      },
      {
        id: 'user_patient_jane',
        email: 'jane.smith@example.com',
        password: patientPassword,
        role: 'patient',
        name: 'Priya Sharma',
        phone: '+91 98123 66666',
        createdAt: new Date().toISOString(),
        status: 'active',
      }
    ];

    // 2. Create Doctor Profiles
    const doctors = [
      {
        userId: 'user_doc_jenkins',
        name: 'Dr. Sunita Sharma',
        email: 'sharma@medibook.com',
        phone: '+91 98123 45678',
        specialization: 'Cardiology',
        experience: 12,
        bio: 'Dr. Sunita Sharma is an experienced cardiologist specializing in preventive cardiology, heart failure management, and advanced cardiovascular diagnostics.',
        consultationFee: 800,
        qualifications: 'MD, DM - Cardiology (AIIMS New Delhi)',
        clinicAddress: 'Apex Heart Care, Sector 15, Gurugram, Haryana',
        isApproved: true,
        rating: 4.9,
        reviewsCount: 38,
        availability: {
          Monday: ['09:00', '10:00', '11:00', '14:00', '15:00'],
          Wednesday: ['09:00', '10:00', '11:00', '14:00', '15:00'],
          Friday: ['09:00', '10:00', '11:00', '14:00'],
        }
      },
      {
        userId: 'user_doc_chen',
        name: 'Dr. Rajeev Mehta',
        email: 'mehta@medibook.com',
        phone: '+91 98123 78901',
        specialization: 'Dermatology',
        experience: 8,
        bio: 'Dr. Rajeev Mehta focuses on pediatric and adult clinical dermatology, skin cancer screenings, and advanced laser dermatological surgery.',
        consultationFee: 600,
        qualifications: 'MD, DNB (KEM Hospital Mumbai)',
        clinicAddress: 'Skin & Laser Wellness Center, MG Road, Pune, Maharashtra',
        isApproved: true,
        rating: 4.7,
        reviewsCount: 24,
        availability: {
          Tuesday: ['10:00', '11:00', '13:00', '14:00', '15:00', '16:00'],
          Thursday: ['10:00', '11:00', '13:00', '14:00', '15:00', '16:00'],
        }
      },
      {
        userId: 'user_doc_ross',
        name: 'Dr. Ananya Iyer',
        email: 'iyer@medibook.com',
        phone: '+91 98123 11111',
        specialization: 'Pediatrics',
        experience: 15,
        bio: 'Dr. Ananya Iyer is passionate about comprehensive pediatric care from newborn checkups to adolescent health and developmental milestones.',
        consultationFee: 500,
        qualifications: 'MD, DCH (Christian Medical College, Vellore)',
        clinicAddress: 'Kids First Pediatrics, Indiranagar, Bengaluru, Karnataka',
        isApproved: true,
        rating: 4.9,
        reviewsCount: 52,
        availability: {
          Monday: ['08:00', '09:00', '10:00', '11:00'],
          Tuesday: ['08:00', '09:00', '10:00', '11:00'],
          Wednesday: ['08:00', '09:00', '10:00', '11:00'],
          Thursday: ['08:00', '09:00', '10:00', '11:00'],
        }
      },
      {
        userId: 'user_doc_carter',
        name: 'Dr. Kabir Deshmukh',
        email: 'deshmukh@medibook.com',
        phone: '+91 98123 22222',
        specialization: 'Neurology',
        experience: 10,
        bio: 'Dr. Kabir Deshmukh specializes in neurological disorders, including migraine therapies, sleep apnea, neuromuscular conditions, and dementia treatment.',
        consultationFee: 1000,
        qualifications: 'MD, DM - Neurology (NIMHANS Bengaluru)',
        clinicAddress: 'Neurological Sciences Institute, Salt Lake, Kolkata, West Bengal',
        isApproved: false,
        rating: 0.0,
        reviewsCount: 0,
        availability: {
          Monday: ['13:00', '14:00', '15:00', '16:00'],
          Wednesday: ['13:00', '14:00', '15:00', '16:00'],
        }
      }
    ];

    // 3. Create Medical Reports
    const reports = [
      {
        id: 'report_01',
        patientId: 'user_patient_default',
        patientName: 'Aarav Patel',
        fileName: 'blood_panel_may_2026.pdf',
        filePath: '/uploads/dummy_blood_panel.pdf',
        fileSize: '1.2 MB',
        uploadedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        description: 'Complete Blood Count (CBC) and Metabolic Panel from annual checkup.',
        doctorId: 'user_doc_jenkins',
        doctorName: 'Dr. Sunita Sharma',
      }
    ];

    // 4. Create Appointments
    const appointments = [
      {
        id: 'apt_01',
        patientId: 'user_patient_default',
        patientName: 'Aarav Patel',
        patientPhone: '+91 98123 55555',
        doctorId: 'user_doc_jenkins',
        doctorName: 'Dr. Sunita Sharma',
        doctorSpecialization: 'Cardiology',
        date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        timeSlot: '10:00',
        status: 'confirmed',
        reason: 'Regular heart palpitation follow-up and prescription review.',
        medicalReports: [reports[0]],
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'apt_02',
        patientId: 'user_patient_default',
        patientName: 'Aarav Patel',
        patientPhone: '+91 98123 55555',
        doctorId: 'user_doc_chen',
        doctorName: 'Dr. Rajeev Mehta',
        doctorSpecialization: 'Dermatology',
        date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        timeSlot: '14:00',
        status: 'pending',
        reason: 'Evaluating a suspicious mole on my upper left arm.',
        medicalReports: [],
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'apt_03',
        patientId: 'user_patient_jane',
        patientName: 'Priya Sharma',
        patientPhone: '+91 98123 66666',
        doctorId: 'user_doc_ross',
        doctorName: 'Dr. Ananya Iyer',
        doctorSpecialization: 'Pediatrics',
        date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        timeSlot: '09:00',
        status: 'completed',
        reason: 'Toddler 18-month developmental checkup and immunization vaccination.',
        medicalReports: [],
        prescription: {
          medications: 'Infant Crocin Syrup if mild fever occurs.',
          instructions: 'Administer 2.5mL every 4-6 hours as needed. Do not exceed 5 doses in 24 hours.',
          notes: 'Patient was healthy and active. All immunizations up to date.',
          updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        },
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      }
    ];

    this.data = { users, doctors, appointments, reports };
    this.save();
  }

  getUsers() {
    return this.data.users;
  }

  getDoctors() {
    return this.data.doctors;
  }

  getAppointments() {
    return this.data.appointments;
  }

  getReports() {
    return this.data.reports;
  }

  findUser(query) {
    return this.data.users.find((u) => {
      return Object.entries(query).every(([key, value]) => u[key] === value);
    });
  }

  findUserById(id) {
    return this.data.users.find((u) => u.id === id);
  }

  insertUser(user) {
    this.data.users.push(user);
    this.save();
    return user;
  }

  updateUser(id, update) {
    const idx = this.data.users.findIndex((u) => u.id === id);
    if (idx !== -1) {
      this.data.users[idx] = { ...this.data.users[idx], ...update };
      this.save();
      return this.data.users[idx];
    }
    return null;
  }

  findDoctor(query) {
    return this.data.doctors.find((d) => {
      return Object.entries(query).every(([key, value]) => d[key] === value);
    });
  }

  findDoctorById(userId) {
    return this.data.doctors.find((d) => d.userId === userId);
  }

  insertDoctor(doc) {
    this.data.doctors.push(doc);
    this.save();
    return doc;
  }

  updateDoctor(userId, update) {
    const idx = this.data.doctors.findIndex((d) => d.userId === userId);
    if (idx !== -1) {
      this.data.doctors[idx] = { ...this.data.doctors[idx], ...update };
      this.save();
      return this.data.doctors[idx];
    }
    return null;
  }

  findAppointmentById(id) {
    return this.data.appointments.find((a) => a.id === id);
  }

  findAppointments(query) {
    return this.data.appointments.filter((a) => {
      return Object.entries(query).every(([key, value]) => a[key] === value);
    });
  }

  insertAppointment(apt) {
    this.data.appointments.push(apt);
    this.save();
    return apt;
  }

  updateAppointment(id, update) {
    const idx = this.data.appointments.findIndex((a) => a.id === id);
    if (idx !== -1) {
      this.data.appointments[idx] = { ...this.data.appointments[idx], ...update };
      this.save();
      return this.data.appointments[idx];
    }
    return null;
  }

  insertReport(rep) {
    this.data.reports.push(rep);
    this.save();
    return rep;
  }

  deleteReport(id) {
    this.data.reports = this.data.reports.filter((r) => r.id !== id);
    this.save();
  }
}

export const db = new Database();
export default db;
