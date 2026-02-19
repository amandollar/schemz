import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },

  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },

  // 🔹 New field for OAuth users
  googleId: {
    type: String,
    unique: true,
    sparse: true // Allows multiple null values
  },

  password: {
    type: String,
    minlength: 6,
    select: false,
    required: function () {
      // Password required only if NOT a Google user
      return !this.googleId;
    }
  },

  role: {
    type: String,
    enum: ['user', 'organizer', 'admin'],
    default: 'user'
  },

  // User profile fields for eligibility matching
  age: {
    type: Number,
    min: 0
  },

  dateOfBirth: {
    type: Date
  },

  phone: {
    type: String,
    trim: true
  },

  income: {
    type: Number,
    min: 0
  },

  category: {
    type: String,
    enum: ['General', 'OBC', 'SC', 'ST', 'EWS']
  },

  education: {
    type: String,
    enum: [
      'Below 10th',
      '10th Pass',
      '12th Pass',
      'Graduate',
      'Post Graduate',
      'Doctorate'
    ]
  },

  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other']
  },

  state: {
    type: String
  },

  district: {
    type: String
  },

  pinCode: {
    type: String,
    trim: true
  },

  maritalStatus: {
    type: String,
    enum: ['Single', 'Married', 'Widowed', 'Divorced', 'Separated']
  },

  religion: {
    type: String,
    enum: [
      'Hindu',
      'Muslim',
      'Christian',
      'Sikh',
      'Buddhist',
      'Jain',
      'Other',
      'Prefer not to say'
    ]
  },

  disability: {
    type: String,
    enum: ['None', 'Physical', 'Visual', 'Hearing', 'Mental', 'Multiple'],
    default: 'None'
  },

  occupation: {
    type: String
  },

  profileImage: {
    type: String,
    default: ''
  }

}, {
  timestamps: true
});


// 🔹 Hash password before saving (ONLY if password exists)
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});


// 🔹 Method to compare password (only for local users)
userSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) return false; // OAuth users won't have password
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;
