import { generateToken } from '../middleware/auth.js';
import { uploadProfileImage as uploadProfileImageToCloudinary } from '../services/cloudinaryService.js';
import { OAuth2Client } from 'google-auth-library';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);


/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'user'
    });

    // Generate token for immediate login
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Registration successful!',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Check for user (include password for comparison)
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

/**
 * @desc    Get current logged in user
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

/**
 * @desc    Upload profile image
 * @route   POST /api/auth/upload-profile-image
 * @access  Private
 */
export const uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an image file'
      });
    }

    // Validate file type
    if (!req.file.mimetype.startsWith('image/')) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an image file'
      });
    }

    // Upload to Cloudinary
    const imageUrl = await uploadProfileImageToCloudinary(req.file.buffer);

    // Update user profile with new image URL
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { profileImage: imageUrl },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: {
        profileImage: imageUrl,
        user
      }
    });
  } catch (error) {
    console.error('Profile image upload error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to upload profile image'
    });
  }
};

/**
 * @desc    Update user profile
 * @route   PUT /api/auth/profile
 * @access  Private
 */
export const updateProfile = async (req, res) => {
  try {
    const fieldsToUpdate = {
      name: req.body.name,
      age: req.body.age,
      dateOfBirth: req.body.dateOfBirth,
      phone: req.body.phone,
      income: req.body.income,
      category: req.body.category,
      education: req.body.education,
      gender: req.body.gender,
      state: req.body.state,
      district: req.body.district,
      pinCode: req.body.pinCode,
      maritalStatus: req.body.maritalStatus,
      religion: req.body.religion,
      disability: req.body.disability,
      occupation: req.body.occupation,
      profileImage: req.body.profileImage
    };

    // Remove undefined fields
    Object.keys(fieldsToUpdate).forEach(key => 
      fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]
    );

    const user = await User.findByIdAndUpdate(
      req.user._id,
      fieldsToUpdate,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};


export const googleLogin = async (req, res) => {
  try {
    const { credential } = req.body; // ID token from frontend

    if (!credential) {
      return res.status(400).json({ message: 'Google credential missing' });
    }

    // Verify Google ID token
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    const { sub, email, name, picture } = payload;

    // Check if user already exists
    let user = await User.findOne({ email });

    if (!user) {
      // Create new OAuth user
      user = await User.create({
        name,
        email,
        googleId: sub,
        profileImage: picture,
        role: 'user',
      });
    }

    // Generate your existing JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      token,
      data: user,
    });

  } catch (error) {
    console.error('Google Login Error:', error);
    res.status(401).json({ message: 'Google authentication failed' });
  }
};
