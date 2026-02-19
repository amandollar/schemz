import SchemeApplication from '../models/SchemeApplication.js';
import Scheme from '../models/Scheme.js';
import User from '../models/User.js';
import { uploadDocument } from '../services/backblazeService.js';
import mongoose from 'mongoose';

// @desc    Submit a new scheme application
// @route   POST /api/scheme-applications
// @access  Private (User)
export const submitApplication = async (req, res) => {
  try {
    const { schemeId, applicationData, applicantDetails } = req.body;

    // Validate required fields
    if (!schemeId) {
      return res.status(400).json({ success: false, message: 'Scheme ID is required' });
    }

    if (!applicationData || !applicantDetails) {
      return res.status(400).json({ success: false, message: 'Application data and applicant details are required' });
    }

    // Parse JSON strings safely
    let parsedApplicantDetails;
    let parsedApplicationData;

    try {
      parsedApplicantDetails = typeof applicantDetails === 'string'
        ? JSON.parse(applicantDetails)
        : applicantDetails;
      parsedApplicationData = typeof applicationData === 'string'
        ? JSON.parse(applicationData)
        : applicationData;
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      return res.status(400).json({
        success: false,
        message: 'Invalid data format. Please try again.'
      });
    }

    // Validate required applicant details for application
    const requiredFields = {
      name: 'Full Name',
      email: 'Email Address',
      phone: 'Phone Number',
      age: 'Age',
      gender: 'Gender',
      category: 'Category',
      state: 'State',
      education: 'Education'
    };

    const missingFields = [];
    Object.keys(requiredFields).forEach(field => {
      const value = parsedApplicantDetails[field];
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        missingFields.push(requiredFields[field]);
      }
    });

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Please complete your profile before applying. Missing fields: ${missingFields.join(', ')}`,
        missingFields
      });
    }

    // Validate required application data
    if (!parsedApplicationData.purpose) {
      return res.status(400).json({
        success: false,
        message: 'Purpose of application is required'
      });
    }

    // Check if scheme exists and is approved
    const scheme = await Scheme.findById(schemeId);
    if (!scheme) {
      return res.status(404).json({ success: false, message: 'Scheme not found' });
    }

    if (scheme.status !== 'approved') {
      return res.status(400).json({ success: false, message: 'Scheme is not active for applications' });
    }

    // Fetch user profile for fallback documents
    const userProfile = await User.findById(req.user._id).select('aadhaarNumber bankDetails documents');

    // Merge application data with profile fallbacks (profile values used when application data is empty)
    if (!parsedApplicationData.aadhaarNumber && userProfile?.aadhaarNumber) {
      parsedApplicationData.aadhaarNumber = userProfile.aadhaarNumber;
    }
    if (!parsedApplicationData.bankDetails || Object.values(parsedApplicationData.bankDetails || {}).every(v => !v)) {
      if (userProfile?.bankDetails && Object.values(userProfile.bankDetails).some(v => v)) {
        parsedApplicationData.bankDetails = userProfile.bankDetails;
      }
    }

    // Upload documents - use profile documents when not provided in request
    const documents = {};

    // Marksheet is always required per application (scheme-specific: 10th/12th/degree)
    if (req.files?.marksheet?.[0]) {
      const file = req.files.marksheet[0];
      documents.marksheet = await uploadDocument(
        file.buffer,
        'marksheets',
        file.originalname || 'marksheet.pdf'
      );
    } else {
      return res.status(400).json({ success: false, message: 'Marksheet/Educational certificate is required' });
    }

    // Income certificate: use uploaded file or profile document
    if (req.files?.incomeCertificate?.[0]) {
      const file = req.files.incomeCertificate[0];
      documents.incomeCertificate = await uploadDocument(
        file.buffer,
        'certificates',
        file.originalname || 'income-certificate.pdf'
      );
    } else if (userProfile?.documents?.incomeCertificate) {
      documents.incomeCertificate = userProfile.documents.incomeCertificate;
    }

    // Category certificate: use uploaded file or profile document
    if (req.files?.categoryCertificate?.[0]) {
      const file = req.files.categoryCertificate[0];
      documents.categoryCertificate = await uploadDocument(
        file.buffer,
        'certificates',
        file.originalname || 'category-certificate.pdf'
      );
    } else if (userProfile?.documents?.categoryCertificate) {
      documents.categoryCertificate = userProfile.documents.categoryCertificate;
    }

    // Other documents: always from upload (scheme-specific)
    if (req.files?.otherDocuments?.length > 0) {
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

    // Clean up applicant details: convert empty strings to undefined for enum fields
    // This prevents Mongoose validation errors for enum fields
    const cleanedApplicantDetails = {
      ...parsedApplicantDetails,
      phone: parsedApplicantDetails.phone || '',
      // Convert empty strings to undefined for enum fields
      gender: parsedApplicantDetails.gender && parsedApplicantDetails.gender.trim() !== ''
        ? parsedApplicantDetails.gender
        : undefined,
      category: parsedApplicantDetails.category && parsedApplicantDetails.category.trim() !== ''
        ? parsedApplicantDetails.category
        : undefined,
      maritalStatus: parsedApplicantDetails.maritalStatus && parsedApplicantDetails.maritalStatus.trim() !== ''
        ? parsedApplicantDetails.maritalStatus
        : undefined,
      disability: parsedApplicantDetails.disability && parsedApplicantDetails.disability.trim() !== ''
        ? parsedApplicantDetails.disability
        : undefined
    };

    // Create application atomically to prevent race conditions
    // Use transaction to ensure atomic check-and-create
    try {
      // Check if application already exists
      const existingApplication = await SchemeApplication.findOne({
        user: req.user._id,
        scheme: schemeId
      });

      if (existingApplication) {
        return res.status(400).json({
          success: false,
          message: 'You have already applied to this scheme'
        });
      }

      // Create application
      const application = await SchemeApplication.create({
        user: req.user._id,
        scheme: schemeId,
        applicantDetails: cleanedApplicantDetails,
        applicationData: parsedApplicationData,
        documents
      });

      res.status(201).json({
        success: true,
        message: 'Application submitted successfully',
        data: application
      });
    } catch (error) {
      // Check if error is due to duplicate key (race condition)
      if (error.code === 11000 || error.message?.includes('duplicate')) {
        return res.status(400).json({
          success: false,
          message: 'You have already applied to this scheme'
        });
      }

      throw error;
    }
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

    // Check if scheme was populated (scheme might have been deleted)
    if (!application.scheme || typeof application.scheme === 'string') {
      return res.status(404).json({ success: false, message: 'Scheme not found for this application' });
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

    // Check if scheme was populated (scheme might have been deleted)
    if (!application.scheme || typeof application.scheme === 'string') {
      return res.status(404).json({ success: false, message: 'Scheme not found for this application' });
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
