import User from '../models/User.js';

export const getUnverifiedEmployers = async (req, res) => {
  try {
    // Employers still waiting for verification, newest first.
    const employers = await User.find({
      role: 'employer',
      'employerProfile.isVerified': false,
    })
      .select('fullName email employerProfile createdAt')
      .sort({ createdAt: -1 });

    res.status(200).json({ employers });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const verifyEmployer = async (req, res) => {
  try {
    const { id } = req.params;

    // Load the target user.
    const employer = await User.findById(id);
    if (!employer) {
      return res.status(404).json({ message: 'Employer not found' });
    }

    // Only employers can be verified. Guard against verifying a
    // student or coordinator by mistake.
    if (employer.role !== 'employer') {
      return res.status(400).json({ message: 'This user is not an employer' });
    }

    // Flip the flag and save.
    employer.employerProfile.isVerified = true;
    await employer.save();

    res.status(200).json({
      message: 'Employer verified successfully',
      employer: {
        id: employer._id,
        organisationName: employer.employerProfile.organisationName,
        isVerified: employer.employerProfile.isVerified,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
