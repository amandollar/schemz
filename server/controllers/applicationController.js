import OrganizerApplication from '../models/OrganizerApplication.js';
import User from '../models/User.js';

/**
 * @desc    Submit application to become organizer
 * @route   POST /api/application/organizer
 * @access  Private (User)
 */
export const submitOrganizerApplication = async (req, res) => {
  try {
    const { organization, designation, reason, contactNumber } = req.body;

    // Check if user is already an organizer or admin
    if (req.user.role !== 'user') {
      return res.status(400).json({ 
        message: 'Only regular users can apply to become organizers' 
      });
    }

    // Check if user already has a pending application
    const existingApplication = await OrganizerApplication.findOne({
      user: req.user.id,
      status: 'pending'
    });

    if (existingApplication) {
      return res.status(400).json({ 
        message: 'You already have a pending application' 
      });
    }

    const application = await OrganizerApplication.create({
      user: req.user.id,
      organization,
      designation,
      reason,
      contactNumber
    });

    // Populate user details
    await application.populate('user', 'name email');

    res.status(201).json({
      success: true,
      data: application
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

/**
 * @desc    Get current user's applications
 * @route   GET /api/application/my-applications
 * @access  Private (User)
 */
export const getMyApplications = async (req, res) => {
  try {
    const applications = await OrganizerApplication.find({ user: req.user.id })
      .populate('reviewedBy', 'name email')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: applications.length,
      data: applications
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

/**
 * @desc    Get application status
 * @route   GET /api/application/status
 * @access  Private (User)
 */
export const getApplicationStatus = async (req, res) => {
  try {
    const application = await OrganizerApplication.findOne({ 
      user: req.user.id 
    })
    .sort('-createdAt')
    .populate('reviewedBy', 'name email');

    if (!application) {
      return res.status(404).json({ 
        success: true,
        data: null,
        message: 'No application found' 
      });
    }

    res.status(200).json({
      success: true,
      data: application
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};
