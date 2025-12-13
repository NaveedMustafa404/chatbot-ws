const messageRepository = require('../repositories/messageRepository');
const roomMemberRepository = require('../repositories/roomMemberRepository');

const getRoomMessages = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;

    const isMember = await roomMemberRepository.isMember(id, userId);
    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: 'You must be a member to view messages'
      });
    }

    const messages = await messageRepository.getRoomMessages(id, limit, offset);
    const totalCount = await messageRepository.getMessageCount(id);

    res.status(200).json({
      success: true,
      data: {
        messages,
        pagination: {
          limit,
          offset,
          total: totalCount,
          hasMore: offset + limit < totalCount
        }
      }
    });

  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get messages',
      error: error.message
    });
  }
};

module.exports = {
  getRoomMessages
};