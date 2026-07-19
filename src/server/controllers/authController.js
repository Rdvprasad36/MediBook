import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'medibook_secret_key_123';
const JWT_EXPIRES_IN = '7d';

export async function register(req, res) {
  try {
    const { email, password, role, name, phone, specialization, experience, bio, consultationFee, qualifications, clinicAddress } = req.body;

    if (!email || !password || !role || !name || !phone) {
      return res.status(400).json({ message: 'All standard fields (email, password, role, name, phone) are required' });
    }

    if (role !== 'patient' && role !== 'doctor') {
      return res.status(400).json({ message: 'Invalid role. Must be either patient or doctor' });
    }

    // Check if email already exists
    const existingUser = db.findUser({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'Email is already registered' });
    }

    // Password validation
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const userId = `user_${Date.now()}_${Math.round(Math.random() * 1000)}`;

    const newUser = {
      id: userId,
      email: email.toLowerCase(),
      password: hashedPassword,
      role,
      name,
      phone,
      createdAt: new Date().toISOString(),
      status: 'active',
      notification: [],
      seennotification: []
    };

    db.insertUser(newUser);

    let docProfile = null;

    if (role === 'doctor') {
      if (!specialization || !experience || !consultationFee || !qualifications || !clinicAddress) {
        return res.status(400).json({ message: 'Doctor profiles require specialization, experience, consultation fee, qualifications, and clinic address' });
      }

      docProfile = {
        userId,
        name,
        email: email.toLowerCase(),
        phone,
        specialization,
        experience: Number(experience),
        bio: bio || '',
        consultationFee: Number(consultationFee),
        qualifications,
        clinicAddress,
        isApproved: false, // Must be approved by Admin
        rating: 0.0,
        reviewsCount: 0,
        availability: {
          Monday: ['09:00', '10:00', '11:00', '14:00', '15:00'],
          Tuesday: ['09:00', '10:00', '11:00', '14:00', '15:00'],
          Wednesday: ['09:00', '10:00', '11:00', '14:00', '15:00'],
          Thursday: ['09:00', '10:00', '11:00', '14:00', '15:00'],
          Friday: ['09:00', '10:00', '11:00', '14:00', '15:00'],
        },
      };

      db.insertDoctor(docProfile);
    }

    // Issue token
    const token = jwt.sign({ userId, email: newUser.email, role: newUser.role }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    const userResponse = { ...newUser };
    delete userResponse.password;

    return res.status(201).json({
      message: role === 'doctor' ? 'Registration complete. Awaiting admin profile approval.' : 'Registration successful',
      token,
      user: userResponse,
      doctorProfile: docProfile,
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ message: 'Internal server error during registration', error: error.message });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = db.findUser({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (user.status === 'suspended') {
      return res.status(403).json({ message: 'Your account has been suspended. Please contact administrator.' });
    }

    const isMatch = await bcrypt.compare(password, user.password || '');
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign({ userId: user.id, email: user.email, role: user.role }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    const userResponse = { ...user };
    delete userResponse.password;

    let doctorProfile = null;
    if (user.role === 'doctor') {
      doctorProfile = db.findDoctorById(user.id) || null;
    }

    return res.json({
      message: 'Login successful',
      token,
      user: userResponse,
      doctorProfile,
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Internal server error during login', error: error.message });
  }
}

export function getCurrentUser(req, res) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const userResponse = { ...req.user };
    delete userResponse.password;

    let doctorProfile = null;
    if (req.user.role === 'doctor') {
      doctorProfile = db.findDoctorById(req.user.id) || null;
    }

    return res.json({
      user: userResponse,
      doctorProfile,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error retrieving user profile', error: error.message });
  }
}

export function updateProfile(req, res) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const { name, phone, avatar, ...doctorFields } = req.body;

    const updatedUser = db.updateUser(req.user.id, {
      name: name || req.user.name,
      phone: phone || req.user.phone,
      avatar: avatar || req.user.avatar,
    });

    let updatedDocProfile = null;

    if (req.user.role === 'doctor') {
      const currentDoc = db.findDoctorById(req.user.id);
      if (currentDoc) {
        updatedDocProfile = db.updateDoctor(req.user.id, {
          name: name || currentDoc.name,
          phone: phone || currentDoc.phone,
          specialization: doctorFields.specialization || currentDoc.specialization,
          experience: doctorFields.experience !== undefined ? Number(doctorFields.experience) : currentDoc.experience,
          bio: doctorFields.bio !== undefined ? doctorFields.bio : currentDoc.bio,
          consultationFee: doctorFields.consultationFee !== undefined ? Number(doctorFields.consultationFee) : currentDoc.consultationFee,
          qualifications: doctorFields.qualifications || currentDoc.qualifications,
          clinicAddress: doctorFields.clinicAddress || currentDoc.clinicAddress,
          availability: doctorFields.availability || currentDoc.availability,
        });
      }
    }

    const userResponse = { ...updatedUser };
    delete userResponse.password;

    return res.json({
      message: 'Profile updated successfully',
      user: userResponse,
      doctorProfile: updatedDocProfile,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update profile', error: error.message });
  }
}
