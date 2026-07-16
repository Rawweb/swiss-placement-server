import mongoose from 'mongoose';

const studentProfileSchema = new mongoose.Schema(
  {
    courseOfStudy: { type: String, trim: true },
    academicLevel: { type: String, trim: true },
    state: { type: String, trim: true },
    city: { type: String, trim: true },
    skills: { type: String, trim: true },
  },
  { _id: false },
);

// Employer-only fields.
const employerProfileSchema = new mongoose.Schema(
  {
    organisationName: { type: String, trim: true },
    disciplines: { type: String, trim: true },
    state: { type: String, trim: true },
    city: { type: String, trim: true },
    about: { type: String, trim: true },
    isVerified: { type: Boolean, default: false },
  },
  { _id: false },
);

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: { type: String, required: true },

    role: {
      type: String,
      enum: ['student', 'employer', 'coordinator'],
      required: true,
    },
    
    studentProfile: { type: studentProfileSchema, default: undefined },
    employerProfile: { type: employerProfileSchema, default: undefined },
  },
  { timestamps: true },
);

const User = mongoose.model('User', userSchema);

export default User;
