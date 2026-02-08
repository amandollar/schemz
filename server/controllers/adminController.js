import Scheme from '../models/Scheme.js';
import OrganizerApplication from '../models/OrganizerApplication.js';
import User from '../models/User.js';

/**
 * @desc    Get all pending schemes
 * @route   GET /api/admin/schemes/pending
 * @access  Private (Admin)
 */
export const getPendingSchemes = async (req, res) => {
  try {
    const schemes = await Scheme.find({ status: 'pending' })
      .populate('createdBy', 'name email')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: schemes.length,
      data: schemes
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

/**
 * @desc    Get all schemes (for admin dashboard)
 * @route   GET /api/admin/schemes
 * @access  Private (Admin)
 */
export const getAllSchemesAdmin = async (req, res) => {
  try {
    const { status } = req.query;
    
    const filter = status ? { status } : {};
    
    const schemes = await Scheme.find(filter)
      .populate('createdBy', 'name email')
      .populate('approvedBy', 'name email')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: schemes.length,
      data: schemes
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

/**
 * @desc    Approve a scheme
 * @route   POST /api/admin/scheme/:id/approve
 * @access  Private (Admin)
 */
export const approveScheme = async (req, res) => {
  try {
    let scheme = await Scheme.findById(req.params.id);

    if (!scheme) {
      return res.status(404).json({ message: 'Scheme not found' });
    }

    if (scheme.status !== 'pending') {
      return res.status(400).json({ 
        message: 'Only pending schemes can be approved' 
      });
    }

    scheme.status = 'approved';
    scheme.active = true;
    scheme.approvedBy = req.user.id;
    scheme.remarks = req.body.remarks || '';
    
    await scheme.save();

    res.status(200).json({
      success: true,
      data: scheme
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

/**
 * @desc    Reject a scheme
 * @route   POST /api/admin/scheme/:id/reject
 * @access  Private (Admin)
 */
export const rejectScheme = async (req, res) => {
  try {
    let scheme = await Scheme.findById(req.params.id);

    if (!scheme) {
      return res.status(404).json({ message: 'Scheme not found' });
    }

    if (scheme.status !== 'pending') {
      return res.status(400).json({ 
        message: 'Only pending schemes can be rejected' 
      });
    }

    const { remarks } = req.body;

    if (!remarks) {
      return res.status(400).json({ 
        message: 'Rejection remarks are required' 
      });
    }

    scheme.status = 'rejected';
    scheme.active = false;
    scheme.remarks = remarks;
    
    await scheme.save();

    res.status(200).json({
      success: true,
      data: scheme
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

/**
 * @desc    Toggle scheme active status
 * @route   PUT /api/admin/scheme/:id/toggle
 * @access  Private (Admin)
 */
export const toggleSchemeStatus = async (req, res) => {
  try {
    let scheme = await Scheme.findById(req.params.id);

    if (!scheme) {
      return res.status(404).json({ message: 'Scheme not found' });
    }

    if (scheme.status !== 'approved') {
      return res.status(400).json({ 
        message: 'Only approved schemes can be toggled' 
      });
    }

    scheme.active = !scheme.active;
    await scheme.save();

    res.status(200).json({
      success: true,
      data: scheme
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

/**
 * @desc    Get all pending organizer applications
 * @route   GET /api/admin/applications/pending
 * @access  Private (Admin)
 */
export const getPendingApplications = async (req, res) => {
  try {
    const applications = await OrganizerApplication.find({ status: 'pending' })
      .populate('user', 'name email age gender state')
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
 * @desc    Get all organizer applications
 * @route   GET /api/admin/applications
 * @access  Private (Admin)
 */
export const getAllApplications = async (req, res) => {
  try {
    const { status } = req.query;
    
    const filter = status ? { status } : {};
    
    const applications = await OrganizerApplication.find(filter)
      .populate('user', 'name email age gender state')
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
 * @desc    Approve organizer application
 * @route   POST /api/admin/application/:id/approve
 * @access  Private (Admin)
 */
export const approveApplication = async (req, res) => {
  try {
    const application = await OrganizerApplication.findById(req.params.id);

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    if (application.status !== 'pending') {
      return res.status(400).json({ 
        message: 'Only pending applications can be approved' 
      });
    }

    // Update user role to organizer
    const user = await User.findById(application.user);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role !== 'user') {
      return res.status(400).json({ 
        message: 'User is already an organizer or admin' 
      });
    }

    user.role = 'organizer';
    await user.save();

    // Update application status
    application.status = 'approved';
    application.reviewedBy = req.user.id;
    application.reviewedAt = new Date();
    application.remarks = req.body.remarks || 'Application approved';
    
    await application.save();

    res.status(200).json({
      success: true,
      message: 'User promoted to organizer successfully',
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
 * @desc    Reject organizer application
 * @route   POST /api/admin/application/:id/reject
 * @access  Private (Admin)
 */
export const rejectApplication = async (req, res) => {
  try {
    const application = await OrganizerApplication.findById(req.params.id);

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    if (application.status !== 'pending') {
      return res.status(400).json({ 
        message: 'Only pending applications can be rejected' 
      });
    }

    const { remarks } = req.body;

    if (!remarks) {
      return res.status(400).json({ 
        message: 'Rejection remarks are required' 
      });
    }

    application.status = 'rejected';
    application.reviewedBy = req.user.id;
    application.reviewedAt = new Date();
    application.remarks = remarks;
    
    await application.save();

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

