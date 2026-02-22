import SupportQuery from '../models/SupportQuery.js';

/**
 * @desc    Create a new support query (Organizer or Admin)
 * @route   POST /api/support-queries
 * @access  Private (organizer, admin)
 */
export const createQuery = async (req, res) => {
  try {
    const { subject, message } = req.body;

    if (!subject || !message?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Subject and initial message are required'
      });
    }

    const query = await SupportQuery.create({
      createdBy: req.user._id,
      subject: subject.trim(),
      messages: [{
        sender: req.user._id,
        content: message.trim()
      }]
    });

    const populated = await SupportQuery.findById(query._id)
      .populate('createdBy', 'name email role')
      .populate('messages.sender', 'name email');

    res.status(201).json({
      success: true,
      data: populated
    });
  } catch (error) {
    console.error('Create query error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create query'
    });
  }
};

/**
 * @desc    Get my queries (Organizer) or all queries (Admin)
 * @route   GET /api/support-queries
 * @access  Private (organizer, admin)
 */
export const getQueries = async (req, res) => {
  try {
    let filter = {};

    if (req.user.role === 'organizer' || req.user.role === 'user') {
      filter.createdBy = req.user._id;
    }
    // Admin sees all

    const status = req.query.status;
    if (status && ['open', 'resolved'].includes(status)) {
      filter.status = status;
    }

    const queries = await SupportQuery.find(filter)
      .populate('createdBy', 'name email role')
      .sort('-updatedAt');

    res.json({
      success: true,
      data: queries
    });
  } catch (error) {
    console.error('Get queries error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch queries'
    });
  }
};

/**
 * @desc    Get single query with messages
 * @route   GET /api/support-queries/:id
 * @access  Private (organizer, admin)
 */
export const getQueryById = async (req, res) => {
  try {
    const query = await SupportQuery.findById(req.params.id)
      .populate('createdBy', 'name email role')
      .populate('messages.sender', 'name email')
      .populate('resolvedBy', 'name email');

    if (!query) {
      return res.status(404).json({
        success: false,
        message: 'Query not found'
      });
    }

    // Organizer/User can only view their own; Admin can view all
    if ((req.user.role === 'organizer' || req.user.role === 'user') && query.createdBy._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this query'
      });
    }

    res.json({
      success: true,
      data: query
    });
  } catch (error) {
    console.error('Get query error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch query'
    });
  }
};

/**
 * @desc    Send message in a query
 * @route   POST /api/support-queries/:id/messages
 * @access  Private (organizer, admin)
 */
export const sendMessage = async (req, res) => {
  try {
    const { content } = req.body;

    if (!content?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message content is required'
      });
    }

    const query = await SupportQuery.findById(req.params.id);

    if (!query) {
      return res.status(404).json({
        success: false,
        message: 'Query not found'
      });
    }

    if (query.status === 'resolved') {
      return res.status(400).json({
        success: false,
        message: 'Cannot send message to a resolved query'
      });
    }

    // Organizer/User can only message their own; Admin can message any
    if ((req.user.role === 'organizer' || req.user.role === 'user') && query.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to message this query'
      });
    }

    query.messages.push({
      sender: req.user._id,
      content: content.trim()
    });
    await query.save();

    const populated = await SupportQuery.findById(query._id)
      .populate('createdBy', 'name email role')
      .populate('messages.sender', 'name email');

    const newMessage = populated.messages[populated.messages.length - 1];

    // Emit via Socket.io if available
    const io = req.app.get('io');
    if (io) {
      io.to(`query-${query._id}`).emit('new-message', {
        queryId: query._id.toString(),
        message: newMessage
      });
    }

    res.status(201).json({
      success: true,
      data: populated
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to send message'
    });
  }
};

/**
 * @desc    Resolve a query (Admin only)
 * @route   PATCH /api/support-queries/:id/resolve
 * @access  Private (admin)
 */
export const resolveQuery = async (req, res) => {
  try {
    const query = await SupportQuery.findByIdAndUpdate(
      req.params.id,
      {
        status: 'resolved',
        resolvedAt: new Date(),
        resolvedBy: req.user._id
      },
      { new: true }
    )
      .populate('createdBy', 'name email role')
      .populate('messages.sender', 'name email')
      .populate('resolvedBy', 'name email');

    if (!query) {
      return res.status(404).json({
        success: false,
        message: 'Query not found'
      });
    }

    // Emit via Socket.io if available
    const io = req.app.get('io');
    if (io) {
      io.to(`query-${query._id}`).emit('query-resolved', {
        queryId: query._id.toString(),
        query
      });
    }

    res.json({
      success: true,
      data: query
    });
  } catch (error) {
    console.error('Resolve query error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to resolve query'
    });
  }
};
