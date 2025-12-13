const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');
const messageController = require('../controllers/messageController');
const { validateCreateRoom, validateUpdateRoom } = require('../validators/roomValidator');
const { authenticate } = require('../middleware/authMiddleware');

// as all room routes are protected, we apply authentication middleware 
router.use(authenticate);


router.post('/create', validateCreateRoom, roomController.createRoom);
router.get('/', roomController.getAllRooms);
router.get('/my-rooms', roomController.getUserRooms);
router.get('/:id', roomController.getRoomById);
router.post('/:id/join', roomController.joinRoom);
router.post('/:id/leave', roomController.leaveRoom);
router.put('/:id', validateUpdateRoom, roomController.updateRoom);
router.delete('/:id', roomController.deleteRoom);
router.get('/:id/members', roomController.getRoomMembers);

router.get('/:id/messages', messageController.getRoomMessages);

module.exports = router;