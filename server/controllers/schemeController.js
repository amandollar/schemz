import Scheme from '../models/Scheme.js';
import eligibilityEngine from '../services/eligibilityEngine.js';
import User from '../models/User.js';

/**
 * @desc    Get eligible schemes for current user
 * @route   GET /api/schemes/match
 * @access  Private (User)
 */
export const getEligibleSchemes = async (req, res) => {
  try {
    // Get user profile
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get all approved and active schemes
    const schemes = await Scheme.find({ 
      status: 'approved', 
      active: true 
    });

    // Use eligibility engine to find matches
    const eligibleSchemes = eligibilityEngine.findEligibleSchemes(user, schemes);

    res.status(200).json({
      success: true,
      count: eligibleSchemes.length,
      data: eligibleSchemes
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

/**
 * @desc    Get all approved schemes (public view)
 * @route   GET /api/schemes
 * @access  Public
 */
export const getAllSchemes = async (req, res) => {
  try {
    const schemes = await Scheme.find({ 
      status: 'approved', 
      active: true 
    }).select('-rules');

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
 * @desc    Get single scheme details
 * @route   GET /api/schemes/:id
 * @access  Public
 */
export const getScheme = async (req, res) => {
  try {
    const scheme = await Scheme.findById(req.params.id);

    if (!scheme) {
      return res.status(404).json({ message: 'Scheme not found' });
    }

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
