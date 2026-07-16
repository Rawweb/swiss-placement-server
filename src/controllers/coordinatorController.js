import User from '../models/User.js';
import Application from '../models/Application.js';

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

export const getOverviewStats = async (req, res) => {
  try {
    // Total registered students.
    const totalStudents = await User.countDocuments({ role: 'student' });

    // Employers still awaiting verification.
    const pendingEmployers = await User.countDocuments({
      role: 'employer',
      'employerProfile.isVerified': false,
    });

    // Distinct students who have at least one Accepted application.
    // "placed" means accepted somewhere, per our definition.
    const placedStudentIds = await Application.distinct('student', {
      status: 'Accepted',
    });
    const placed = placedStudentIds.length;

    // Not placed is everyone else.
    const notPlaced = totalStudents - placed;

    res.status(200).json({
      totalStudents,
      placed,
      notPlaced,
      pendingEmployers,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getPlacementRecords = async (req, res) => {
  try {
    // Every registered student.
    const students = await User.find({ role: 'student' })
      .select('fullName studentProfile.courseOfStudy')
      .sort({ createdAt: -1 });

    // All Accepted applications, with the employer's organisation name,
    // so we can show WHERE each placed student was accepted.
    const acceptedApps = await Application.find({ status: 'Accepted' }).populate({
      path: 'opportunity',
      select: 'employer',
      populate: { path: 'employer', select: 'employerProfile.organisationName' },
    });

    // Build a lookup: studentId -> organisation they were accepted by.
    const placementByStudent = {};
    acceptedApps.forEach((app) => {
      const orgName = app.opportunity?.employer?.employerProfile?.organisationName || 'Placed';
      placementByStudent[app.student.toString()] = orgName;
    });

    // Combine: each student plus their placement status.
    const records = students.map((student) => {
      const organisation = placementByStudent[student._id.toString()] || null;
      return {
        id: student._id,
        fullName: student.fullName,
        courseOfStudy: student.studentProfile?.courseOfStudy || '',
        status: organisation ? 'Placed' : 'Not yet placed',
        organisation,
      };
    });

    res.status(200).json({ records });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};