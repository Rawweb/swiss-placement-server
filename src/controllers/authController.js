import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const createToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// Shapes the safe user object we send back. Never includes the password.
const publicUser = (user) => ({
  id: user._id,
  fullName: user.fullName,
  email: user.email,
  role: user.role,
});

// Handles POST /api/auth/register
export const registerUser = async (req, res) => {
  try {
    const { fullName, email, password, role } = req.body;

    // Shared fields are required for everyone.
    if (!fullName || !email || !password || !role) {
      return res.status(400).json({ message: 'Full name, email, password and role are required' });
    }

    // Password length is checked here, on the plain password, before hashing.
    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }

    // Role must be one we support.
    if (!['student', 'employer', 'coordinator'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    // Block duplicate emails with a clear message.
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'Email is already registered' });
    }

    // Base user with the shared fields.
    const newUserData = {
      fullName,
      email,
      password: await bcrypt.hash(password, 10),
      role,
    };

    // Enforce role-specific required fields here, where we know the role.
    if (role === 'student') {
      const p = req.body.studentProfile || {};
      if (!p.courseOfStudy || !p.academicLevel || !p.state || !p.city) {
        return res.status(400).json({
          message: 'Students must provide course of study, academic level, state and city',
        });
      }
      // skills is optional, so it is not checked.
      newUserData.studentProfile = {
        courseOfStudy: p.courseOfStudy,
        academicLevel: p.academicLevel,
        state: p.state,
        city: p.city,
        skills: p.skills || '',
      };
    }

    if (role === 'employer') {
      const p = req.body.employerProfile || {};
      if (!p.organisationName || !p.disciplines || !p.state || !p.city) {
        return res.status(400).json({
          message: 'Employers must provide organisation name, disciplines, state and city',
        });
      }
      // about is optional. isVerified always starts false, set by the schema.
      newUserData.employerProfile = {
        organisationName: p.organisationName,
        disciplines: p.disciplines,
        state: p.state,
        city: p.city,
        about: p.about || '',
      };
    }

    const user = await User.create(newUserData);
    const token = createToken(user);

    res.status(201).json({
      message: 'Account created successfully',
      token,
      user: publicUser(user),
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Handles POST /api/auth/login
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = createToken(user);

    res.status(200).json({
      message: 'Login successful',
      token,
      user: publicUser(user),
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const updateMyProfile = async (req, res) => {
  try {
    // The logged-in user's id comes from the verified token.
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update only the profile that matches the user's role.
    // Role and email are never touched here, on purpose.
    if (user.role === 'student') {
      const p = req.body.studentProfile || {};
      user.studentProfile = {
        courseOfStudy: p.courseOfStudy ?? user.studentProfile?.courseOfStudy,
        academicLevel: p.academicLevel ?? user.studentProfile?.academicLevel,
        state: p.state ?? user.studentProfile?.state,
        city: p.city ?? user.studentProfile?.city,
        skills: p.skills ?? user.studentProfile?.skills,
      };
    } else if (user.role === 'employer') {
      const p = req.body.employerProfile || {};
      user.employerProfile = {
        // isVerified is preserved, never editable by the user.
        isVerified: user.employerProfile?.isVerified,
        organisationName: p.organisationName ?? user.employerProfile?.organisationName,
        disciplines: p.disciplines ?? user.employerProfile?.disciplines,
        state: p.state ?? user.employerProfile?.state,
        city: p.city ?? user.employerProfile?.city,
        about: p.about ?? user.employerProfile?.about,
      };
    }

    await user.save();

    res.status(200).json({
      message: 'Profile updated',
      user: publicUser(user),
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};