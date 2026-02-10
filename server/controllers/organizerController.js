import Scheme from '../models/Scheme.js';

/**
 * @desc    Create a new scheme
 * @route   POST /api/organizer/scheme
 * @access  Private (Organizer)
 */
export const createScheme = async (req, res) => {
  try {
    const { name, description, benefits, ministry, rules } = req.body;

    const scheme = await Scheme.create({
      name,
      description,
      benefits,
      ministry,
      rules: rules || [],
      createdBy: req.user._id,
      status: 'draft'
    });

    res.status(201).json({
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
 * @desc    Get all schemes created by organizer
 * @route   GET /api/organizer/schemes
 * @access  Private (Organizer)
 */
export const getOrganizerSchemes = async (req, res) => {
  try {
    const schemes = await Scheme.find({ createdBy: req.user._id })
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
 * @desc    Update a scheme (only if draft or rejected)
 * @route   PUT /api/organizer/scheme/:id
 * @access  Private (Organizer)
 */
export const updateScheme = async (req, res) => {
  try {
    let scheme = await Scheme.findById(req.params.id);

    if (!scheme) {
      return res.status(404).json({ message: 'Scheme not found' });
    }

    // Check ownership
    if (scheme.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this scheme' });
    }

    // Only allow updates if draft or rejected
    if (!['draft', 'rejected'].includes(scheme.status)) {
      return res.status(400).json({ 
        message: 'Cannot update scheme in current status' 
      });
    }

    const { name, description, benefits, ministry, rules } = req.body;

    scheme = await Scheme.findByIdAndUpdate(
      req.params.id,
      { name, description, benefits, ministry, rules },
      { new: true, runValidators: true }
    );

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
 * @desc    Submit scheme for approval
 * @route   POST /api/organizer/scheme/:id/submit
 * @access  Private (Organizer)
 */
export const submitScheme = async (req, res) => {
  try {
    let scheme = await Scheme.findById(req.params.id);

    if (!scheme) {
      return res.status(404).json({ message: 'Scheme not found' });
    }

    // Check ownership
    if (scheme.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Only allow submission if draft or rejected
    if (!['draft', 'rejected'].includes(scheme.status)) {
      return res.status(400).json({ 
        message: 'Scheme already submitted or approved' 
      });
    }

    scheme.status = 'pending';
    scheme.remarks = ''; // Clear previous remarks
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
 * @desc    Delete a scheme (only if draft)
 * @route   DELETE /api/organizer/scheme/:id
 * @access  Private (Organizer)
 */
export const deleteScheme = async (req, res) => {
  try {
    const scheme = await Scheme.findById(req.params.id);

    if (!scheme) {
      return res.status(404).json({ message: 'Scheme not found' });
    }

    // Check ownership
    if (scheme.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Only allow deletion if draft
    if (scheme.status !== 'draft') {
      return res.status(400).json({ 
        message: 'Cannot delete scheme that has been submitted' 
      });
    }

    await scheme.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Scheme deleted'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};
