import mongoose from 'mongoose';

const schemeApplicationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  scheme: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Scheme',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  
  // Applicant details (snapshot at time of application)
  applicantDetails: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    dateOfBirth: { type: Date },
    age: { type: Number },
    gender: { type: String, enum: ['Male', 'Female', 'Other'] },
    category: { type: String, enum: ['General', 'OBC', 'SC', 'ST', 'EWS'] },
    religion: { type: String },
    maritalStatus: { type: String, enum: ['Single', 'Married', 'Divorced', 'Widowed'] },
    state: { type: String },
    district: { type: String },
    education: { type: String },
    occupation: { type: String },
    income: { type: Number },
    disability: { type: String, enum: ['None', 'Physical', 'Visual', 'Hearing', 'Mental', 'Multiple'] }
  },
  
  // Application-specific data
  applicationData: {
    purpose: {
      type: String,
      required: true,
      trim: true
    },
    bankDetails: {
      accountNumber: { type: String, trim: true },
      ifscCode: { type: String, trim: true },
      bankName: { type: String, trim: true },
      branchName: { type: String, trim: true }
    },
    aadhaarNumber: {
      type: String,
      trim: true
    },
    remarks: {
      type: String,
      trim: true
    }
  },
  
  // Uploaded documents
  documents: {
    marksheet: {
      type: String,
      required: true // Cloudinary URL
    },
    incomeCertificate: {
      type: String // Cloudinary URL
    },
    categoryCertificate: {
      type: String // Cloudinary URL
    },
    otherDocuments: [{
      name: String,
      url: String // Cloudinary URL
    }]
  },
  
  // Review information
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: {
    type: Date
  },
  rejectionReason: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Index for faster queries
schemeApplicationSchema.index({ user: 1, scheme: 1 });
schemeApplicationSchema.index({ scheme: 1, status: 1 });
schemeApplicationSchema.index({ status: 1 });

const SchemeApplication = mongoose.model('SchemeApplication', schemeApplicationSchema);

export default SchemeApplication;
