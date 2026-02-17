import mongoose from 'mongoose';

const ruleSchema = new mongoose.Schema({
  field: {
    type: String,
    required: true,
    enum: ['age', 'income', 'category', 'education', 'state', 'gender', 'marital_status', 'disability', 'occupation']
  },
  operator: {
    type: String,
    required: true,
    enum: ['==', '!=', '<', '<=', '>', '>=', 'in', 'not in']
  },
  value: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  weight: {
    type: Number,
    required: true,
    min: 1,
    max: 100,
    default: 10
  }
}, { _id: false });

const schemeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Scheme name is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  benefits: {
    type: String,
    required: [true, 'Benefits are required']
  },
  ministry: {
    type: String,
    required: [true, 'Ministry/Department is required']
  },
  status: {
    type: String,
    enum: ['draft', 'pending', 'approved', 'rejected'],
    default: 'draft'
  },
  active: {
    type: Boolean,
    default: false
  },
  rules: [ruleSchema],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  remarks: {
    type: String
  }
}, {
  timestamps: true
});

// Index for efficient querying
schemeSchema.index({ status: 1, active: 1 });

const Scheme = mongoose.model('Scheme', schemeSchema);

export default Scheme;
