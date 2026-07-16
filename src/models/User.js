import mongoose from 'mongoose';

// A schema is the blueprint for a document in the database.
const userSchema = new mongoose.Schema(
  {
    // Shared fields: every user has these regardless of role.
    fullName: {
      type: String,
      required: true,
      trim: true, // removes accidental spaces at the start/end
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ['student', 'employer', 'coordinator'],
      required: true,
    },

    // Student-only fields. Empty for employers and coordinators.
    studentProfile: {
      courseOfStudy: { type: String, trim: true },
      academicLevel: { type: String, trim: true },
      state: { type: String, trim: true },
      city: { type: String, trim: true },
      skills: { type: String, trim: true },
    },

    // Employer-only fields. Empty for students and coordinators.
    employerProfile: {
      organisationName: { type: String, trim: true },
      disciplines: { type: String, trim: true },
      state: { type: String, trim: true },
      city: { type: String, trim: true },
      about: { type: String, trim: true },
      isVerified: { type: Boolean, default: false },
    },
  },
  {
    // Automatically adds createdAt and updatedAt timestamps to every user.
    timestamps: true,
  },
);

const User = mongoose.model('User', userSchema);

export default User;
