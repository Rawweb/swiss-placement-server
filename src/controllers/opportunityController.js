import Opportunity from '../models/Opportunity.js';
import User from '../models/User.js';

export const createOpportunity = async (req, res) => {
  try {
    const { position, disciplines, requirements, state, city } = req.body;

    // Reject if any required field is missing.
    if (!position || !disciplines || !requirements || !state || !city) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Disciplines must be a non-empty array.
    if (!Array.isArray(disciplines) || disciplines.length === 0) {
      return res
        .status(400)
        .json({ message: 'At least one discipline is required' });
    }

    // employer comes from the verified token, never the request body,
    // so an employer can only ever post as themselves.
    const opportunity = await Opportunity.create({
      employer: req.user.id,
      position,
      disciplines,
      requirements,
      state,
      city,
    });

    res.status(201).json({
      message: 'Opportunity posted successfully',
      opportunity,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getMyOpportunities = async (req, res) => {
  try {
    // Return only openings owned by the logged-in employer, newest first.
    const opportunities = await Opportunity.find({
      employer: req.user.id,
    }).sort({
      createdAt: -1,
    });

    res.status(200).json({ opportunities });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const browseOpportunities = async (req, res) => {
  try {
    const { discipline, state, city } = req.query;

    // Step 1: find the ids of all verified employers.
    const verifiedEmployers = await User.find({
      role: 'employer',
      'employerProfile.isVerified': true,
    }).select('_id');

    const verifiedIds = verifiedEmployers.map((emp) => emp._id);

    // Step 2: build the opening query, starting with the verification rule.
    // $in matches openings whose employer is in the verified list.
    const query = { employer: { $in: verifiedIds } };

    // Add the discipline filter if provided. The disciplines field is an
    // array, so this matches openings that include the chosen discipline.
    if (discipline) {
      query.disciplines = discipline;
    }

    // Add location filters if provided.
    if (state) query.state = state;
    if (city) query.city = city;

    // Fetch matching openings, newest first, and pull in the employer's
    // organisation name and location for display.
    const opportunities = await Opportunity.find(query)
      .populate(
        'employer',
        'employerProfile.organisationName employerProfile.state employerProfile.city',
      )
      .sort({ createdAt: -1 });

    res.status(200).json({ opportunities });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
