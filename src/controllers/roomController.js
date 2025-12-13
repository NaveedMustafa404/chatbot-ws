const roomRepository = require('../repositories/roomRepository');
const roomMemberRepository = require('../repositories/roomMemberRepository');


const createRoom = async (req, res) => {
  try {
    const { name } = req.body;
    const userId = req.user.userId;
    
    // roomcreate
    const roomId = await roomRepository.createRoom(name, userId);
    
    //  loggedin user becomes member
    await roomMemberRepository.addMember(roomId, userId);
    
    // roomdetails
    const room = await roomRepository.findById(roomId);
    
    res.status(201).json({
      success: true,
      message: 'Room created successfully',
      data: { room }
    });
    
  } catch (error) {
    console.error('Create room error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create room',
      error: error.message
    });
  }
};


const getAllRooms = async (req, res) => {
  try {
    const rooms = await roomRepository.findAll();
    
    res.status(200).json({
      success: true,
      data: { rooms }
    });
    
  } catch (error) {
    console.error('Get all rooms error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get rooms',
      error: error.message
    });
  }
};


const getRoomById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const room = await roomRepository.findById(id);
    
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }
    
    // Get members
    const members = await roomMemberRepository.getRoomMembers(id);
    
    res.status(200).json({
      success: true,
      data: { 
        room,
        members
      }
    });
    
  } catch (error) {
    console.error('Get room error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get room',
      error: error.message
    });
  }
};


const getUserRooms = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const rooms = await roomRepository.findUserRooms(userId);
    
    res.status(200).json({
      success: true,
      data: { rooms }
    });
    
  } catch (error) {
    console.error('Get user rooms error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user rooms',
      error: error.message
    });
  }
};


const joinRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    
    // if room exists?
    const room = await roomRepository.findById(id);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }
    
    // if member already?
    const alreadyMember = await roomMemberRepository.isMember(id, userId);
    if (alreadyMember) {
      return res.status(409).json({
        success: false,
        message: 'You are already a member of this room'
      });
    }
    
    await roomMemberRepository.addMember(id, userId);
    
    res.status(200).json({
      success: true,
      message: 'Joined room successfully',
      data: { room }
    });
    
  } catch (error) {
    console.error('Join room error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to join room',
      error: error.message
    });
  }
};


const leaveRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    
    const room = await roomRepository.findById(id);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }
    
    const isMember = await roomMemberRepository.isMember(id, userId);
    if (!isMember) {
      return res.status(400).json({
        success: false,
        message: 'You are not a member of this room'
      });
    }
    
    if (room.created_by === userId) {
      return res.status(400).json({
        success: false,
        message: 'Room creator cannot leave. Delete the room instead.'
      });
    }
    
    await roomMemberRepository.removeMember(id, userId);
    
    res.status(200).json({
      success: true,
      message: 'Left room successfully'
    });
    
  } catch (error) {
    console.error('Leave room error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to leave room',
      error: error.message
    });
  }
};


const updateRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const userId = req.user.userId;
    
    const room = await roomRepository.findById(id);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }
    
    const isCreator = await roomRepository.isRoomCreator(id, userId);
    if (!isCreator) {
      return res.status(403).json({
        success: false,
        message: 'Only room creator can update the room'
      });
    }
    
    await roomRepository.updateRoom(id, name);
    
    const updatedRoom = await roomRepository.findById(id);
    
    res.status(200).json({
      success: true,
      message: 'Room updated successfully',
      data: { room: updatedRoom }
    });
    
  } catch (error) {
    console.error('Update room error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update room',
      error: error.message
    });
  }
};


const deleteRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    
    const room = await roomRepository.findById(id);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }
    
    const isCreator = await roomRepository.isRoomCreator(id, userId);
    if (!isCreator) {
      return res.status(403).json({
        success: false,
        message: 'Only room creator can delete the room'
      });
    }
    
    await roomRepository.deleteRoom(id);
    
    res.status(200).json({
      success: true,
      message: 'Room deleted successfully'
    });
    
  } catch (error) {
    console.error('Delete room error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete room',
      error: error.message
    });
  }
};

const getRoomMembers = async (req, res) => {
  try {
    const { id } = req.params;
    
    const room = await roomRepository.findById(id);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }
    
    const members = await roomMemberRepository.getRoomMembers(id);
    
    res.status(200).json({
      success: true,
      data: { members }
    });
    
  } catch (error) {
    console.error('Get room members error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get room members',
      error: error.message
    });
  }
};

module.exports = {
  createRoom,
  getAllRooms,
  getRoomById,
  getUserRooms,
  joinRoom,
  leaveRoom,
  updateRoom,
  deleteRoom,
  getRoomMembers
};