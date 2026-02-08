import SchemeApplication from '../models/SchemeApplication.js';
import Scheme from '../models/Scheme.js';
import { uploadDocument } from '../services/backblazeService.js';

// @desc    Submit a new scheme application
// @route   POST /api/scheme-applications
// @access  Private (User)
export const submitApplication = async (req, res) => {
  try {
    const { schemeId, applicationData, applicantDetails } = req.body;
    
    // Check if scheme exists and is approved
    const scheme = await Scheme.findById(schemeId);
    if (!scheme) {
      return res.status(404).json({ success: false, message: 'Scheme not found' });
    }
    
    if (scheme.status !== 'approved') {
      return res.status(400).json({ success: false, message: 'Scheme is not active for applications' });
    }
    
    // Check if user already applied
    const existingApplication = await SchemeApplication.findOne({
      user: req.user._id,
      scheme: schemeId
    });
    
    if (existingApplication) {
      return res.status(400).json({ success: false, message: 'You have already applied to this scheme' });
    }
    
    // Upload documents to Cloudinary
    const documents = {};
    
    try {
      if (req.files.marksheet && req.files.marksheet[0]) {
        const file = req.files.marksheet[0];
        documents.marksheet = await uploadDocument(
          file.buffer, 
          'marksheets',
          file.originalname || 'marksheet.pdf'
        );
      } else {
        return res.status(400).json({ success: false, message: 'Marksheet is required' });
      }
      
      if (req.files.incomeCertificate && req.files.incomeCertificate[0]) {
        const file = req.files.incomeCertificate[0];
        documents.incomeCertificate = await uploadDocument(
          file.buffer, 
          'certificates',
          file.originalname || 'income-certificate.pdf'
        );
      }
      
      if (req.files.categoryCertificate && req.files.categoryCertificate[0]) {
        const file = req.files.categoryCertificate[0];
        documents.categoryCertificate = await uploadDocument(
          file.buffer, 
          'certificates',
          file.originalname || 'category-certificate.pdf'
        );
      }
      
      if (req.files.otherDocuments && req.files.otherDocuments.length > 0) {
        documents.otherDocuments = await Promise.all(
          req.files.otherDocuments.map(async (file) => ({
            name: file.originalname || 'document',
            url: await uploadDocument(
              file.buffer, 
              'other-documents',
              file.originalname || 'document.pdf'
            )
          }))
        );
      }
    } catch (uploadError) {
      console.error('Document upload error:', uploadError);
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to upload documents. Please try again.' 
      });
    }
    
    // Create application
    const application = await SchemeApplication.create({
      user: req.user._id,
      scheme: schemeId,
      applicantDetails: JSON.parse(applicantDetails),
      applicationData: JSON.parse(applicationData),
      documents
    });
    
    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: application
    });
  } catch (error) {
    console.error('Submit application error:', error);
    res.status(500).json({ success: false, message: 'Failed to submit application', error: error.message });
  }
};

// @desc    Get user's applications
// @route   GET /api/scheme-applications/my-applications
// @access  Private (User)
export const getMyApplications = async (req, res) => {
  try {
    const applications = await SchemeApplication.find({ user: req.user._id })
      .populate('scheme', 'name description benefits ministry')
      .sort('-createdAt');
    
    res.json({
      success: true,
      data: applications
    });
  } catch (error) {
    console.error('Get my applications error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch applications' });
  }
};

// @desc    Check if user has applied to a scheme
// @route   GET /api/scheme-applications/check/:schemeId
// @access  Private (User)
export const checkApplication = async (req, res) => {
  try {
    const { schemeId } = req.params;
    
    const application = await SchemeApplication.findOne({
      user: req.user._id,
      scheme: schemeId
    });
    
    res.json({
      success: true,
      hasApplied: !!application,
      application: application || null
    });
  } catch (error) {
    console.error('Check application error:', error);
    res.status(500).json({ success: false, message: 'Failed to check application status' });
  }
};

// @desc    Get applications for a specific scheme
// @route   GET /api/scheme-applications/scheme/:schemeId
// @access  Private (Organizer/Admin)
export const getSchemeApplications = async (req, res) => {
  try {
    const { schemeId } = req.params;
    
    // Check if scheme exists
    const scheme = await Scheme.findById(schemeId);
    if (!scheme) {
      return res.status(404).json({ success: false, message: 'Scheme not found' });
    }
    
    // If organizer, check if they own the scheme
    if (req.user.role === 'organizer' && scheme.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to view these applications' });
    }
    
    const applications = await SchemeApplication.find({ scheme: schemeId })
      .populate('user', 'name email')
      .sort('-createdAt');
    
    res.json({
      success: true,
      data: applications
    });
  } catch (error) {
    console.error('Get scheme applications error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch applications' });
  }
};

// @desc    Get all applications (Admin only)
// @route   GET /api/scheme-applications
// @access  Private (Admin)
export const getAllApplications = async (req, res) => {
  try {
    const { status, schemeId } = req.query;
    
    const filter = {};
    if (status) filter.status = status;
    if (schemeId) filter.scheme = schemeId;
    
    const applications = await SchemeApplication.find(filter)
      .populate('user', 'name email')
      .populate('scheme', 'name ministry')
      .sort('-createdAt');
    
    res.json({
      success: true,
      data: applications
    });
  } catch (error) {
    console.error('Get all applications error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch applications' });
  }
};

// @desc    Approve application
// @route   PATCH /api/scheme-applications/:id/approve
// @access  Private (Organizer/Admin)
export const approveApplication = async (req, res) => {
  try {
    const application = await SchemeApplication.findById(req.params.id).populate('scheme');
    
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }
    
    // If organizer, check if they own the scheme
    if (req.user.role === 'organizer' && application.scheme.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to approve this application' });
    }
    
    application.status = 'approved';
    application.reviewedBy = req.user._id;
    application.reviewedAt = new Date();
    
    await application.save();
    
    res.json({
      success: true,
      message: 'Application approved successfully',
      data: application
    });
  } catch (error) {
    console.error('Approve application error:', error);
    res.status(500).json({ success: false, message: 'Failed to approve application' });
  }
};

// @desc    Reject application
// @route   PATCH /api/scheme-applications/:id/reject
// @access  Private (Organizer/Admin)
export const rejectApplication = async (req, res) => {
  try {
    const { reason } = req.body;
    
    if (!reason) {
      return res.status(400).json({ success: false, message: 'Rejection reason is required' });
    }
    
    const application = await SchemeApplication.findById(req.params.id).populate('scheme');
    
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }
    
    // If organizer, check if they own the scheme
    if (req.user.role === 'organizer' && application.scheme.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to reject this application' });
    }
    
    application.status = 'rejected';
    application.reviewedBy = req.user._id;
    application.reviewedAt = new Date();
    application.rejectionReason = reason;
    
    await application.save();
    
    res.json({
      success: true,
      message: 'Application rejected',
      data: application
    });
  } catch (error) {
    console.error('Reject application error:', error);
    res.status(500).json({ success: false, message: 'Failed to reject application' });
  }
};
