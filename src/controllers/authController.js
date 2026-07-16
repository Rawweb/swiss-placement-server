import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const createToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role }, 
    process.env.JWT_SECRET,
    { expiresIn: '7d' },
  );
};

// Handles POST /api/auth/register
export const registerUser = async (req, res) => {
  try {
    const { fullName, email, password, role } = req.body;

    // Refuse the request if any required field is missing.
    if (!fullName || !email || !password || !role) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Block registration if the email is already taken.
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'Email is already registered' });
    }

    // Hash the password before saving. 10 is the safe default work factor.
    const hashedPassword = await bcrypt.hash(password, 10);

    // Base user with the shared fields.
    const newUserData = {
      fullName,
      email,
      password: hashedPassword,
      role,
    };

    // Attach the correct profile based on role, if it was sent.
    if (role === 'student' && req.body.studentProfile) {
      newUserData.studentProfile = req.body.studentProfile;
    }
    if (role === 'employer' && req.body.employerProfile) {
      newUserData.employerProfile = req.body.employerProfile;
    }

    // Save the new user.
    const user = await User.create(newUserData);

    // Give the new user a token so they are logged in right after registering.
    const token = createToken(user);

    // Return safe fields only. Never send the password back.
    res.status(201).json({
      message: 'Account created successfully',
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Handles POST /api/auth/login
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Both fields are required to log in.
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find the user by email.
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Compare the typed password against the stored hash.
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Credentials are correct. Build a token.
    const token = createToken(user);

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
