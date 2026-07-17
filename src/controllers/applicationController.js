import Application from '../models/Application.js';
import Opportunity from '../models/Opportunity.js';
import User from '../models/User.js';

export const applyToOpportunity = async (req, res) => {
  try {
    const { opportunityId } = req.body;

    if (!opportunityId) {
      return res.status(400).json({ message: 'Opportunity id is required' });
    }

    // Confirm the opening exists before applying to it.
    const opportunity = await Opportunity.findById(opportunityId).populate('employer');
    if (!opportunity) {
      return res.status(404).json({ message: 'Opportunity not found' });
    }

    // Enforce the document rule: students only apply to openings from
    // verified employers. An unverified employer's openings are not open.
    if (!opportunity.employer?.employerProfile?.isVerified) {
      return res.status(403).json({ message: 'This opportunity is not open for applications' });
    }

    // Block a duplicate application to the same opening.
    const existing = await Application.findOne({
      student: req.user.id,
      opportunity: opportunityId,
    });
    if (existing) {
      return res.status(409).json({ message: 'You have already applied to this opportunity' });
    }

    // student comes from the verified token, not the body.
    const application = await Application.create({
      student: req.user.id,
      opportunity: opportunityId,
    });

    res.status(201).json({
      message: 'Application submitted successfully',
      application,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getMyApplications = async (req, res) => {
  try {
    // Find this student's applications, newest first, and pull in the
    // opening details plus the employer's organisation name for display.
    const applications = await Application.find({ student: req.user.id })
      .populate({
        path: 'opportunity',
        select: 'position state city employer',
        populate: {
          path: 'employer',
          select: 'employerProfile.organisationName',
        },
      })
      .sort({ createdAt: -1 });

    res.status(200).json({ applications });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getApplicationsForMyOpportunities = async (req, res) => {
  try {
    // Find the ids of openings owned by this employer.
    const myOpportunities = await Opportunity.find({
      employer: req.user.id,
    }).select('_id');
    const myOpportunityIds = myOpportunities.map((o) => o._id);

    // Optional filter: applications for one specific opening.
    const query = { opportunity: { $in: myOpportunityIds } };
    if (req.query.opportunityId) {
      query.opportunity = req.query.opportunityId;
    }

    // Fetch them, newest first, with the applicant's details and the
    // opening's position for display.
    const applications = await Application.find(query)
      .populate(
        'student',
        'fullName studentProfile.courseOfStudy studentProfile.academicLevel studentProfile.state studentProfile.city studentProfile.skills',
      )
      .populate('opportunity', 'position')
      .sort({ createdAt: -1 });

    res.status(200).json({ applications });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const decideApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Only these two decisions are allowed through this action.
    if (!['Accepted', 'Declined', 'Under Review'].includes(status)) {
      return res.status(400).json({ message: 'Status must be Under Review, Accepted or Declined' });
    }

    // Load the application and follow it to its opportunity and employer.
    const application = await Application.findById(id).populate('opportunity');
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Ownership check: the opening's employer must be the logged-in user.
    if (application.opportunity.employer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You cannot act on this application' });
    }

    // Apply the decision and save.
    application.status = status;
    await application.save();

    res.status(200).json({
      message: 'Application updated',
      application,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getAllApplications = async (req, res) => {
  try {
    // Coordinator sees every application, newest first.
    // Pull the applicant's name and the opening's position plus its
    // employer's organisation name, so the feed reads
    // "student applied to organisation".
    const applications = await Application.find()
      .populate('student', 'fullName')
      .populate({
        path: 'opportunity',
        select: 'position employer',
        populate: {
          path: 'employer',
          select: 'employerProfile.organisationName',
        },
      })
      .sort({ createdAt: -1 });

    res.status(200).json({ applications });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};