import mongoose from 'mongoose';

const organizerApplicationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  organization: {
    type: String,
    required: [true, 'Organization/Department name is required'],
    trim: true
  },
  designation: {
    type: String,
    required: [true, 'Designation is required'],
    trim: true
  },
  reason: {
    type: String,
    required: [true, 'Reason for application is required'],
    minlength: 50
  },
  contactNumber: {
    type: String,
    required: [true, 'Contact number is required']
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  remarks: {
    type: String
  },
  reviewedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for efficient querying
organizerApplicationSchema.index({ user: 1, status: 1 });

const OrganizerApplication = mongoose.model('OrganizerApplication', organizerApplicationSchema);

export default OrganizerApplication;
