const WebSocket = require('ws');
const { verifyToken } = require('../utils/jwt');
const messageRepository = require('../repositories/messageRepository');
const roomMemberRepository = require('../repositories/roomMemberRepository');


const clients = new Map();
const roomSubscriptions = new Map();

// Initialize WebSocket server
function initWebSocketServer(server) {
  const wss = new WebSocket.Server({ server });

  wss.on('connection', async (ws, req) => {
    console.log('New WebSocket connection attempt');

    const token = extractToken(req);

    if (!token) {
      ws.close(4001, 'Authentication required');
      return;
    }

    try {
      const decoded = verifyToken(token);
      const userId = decoded.userId;

      ws.userId = userId;
      ws.isAlive = true;
      clients.set(userId, ws);

      console.log(`✅ User ${userId} (${decoded.username}) connected via WebSocket`);

      ws.send(JSON.stringify({
        type: 'connection',
        message: 'Connected to WebSocket server',
        userId: userId,
        username: decoded.username
      }));

      ws.on('message', async (data) => {
        await handleMessage(ws, data);
      });

      ws.on('pong', () => {
        ws.isAlive = true;
      });

      ws.on('close', () => {
        handleDisconnect(userId);
      });

      ws.on('error', (error) => {
        console.error(`WebSocket error for user ${userId}:`, error);
      });

    } catch (error) {
      console.error('WebSocket auth error:', error);
      ws.close(4001, 'Invalid token');
    }
  });

// Heartbeat every 30 seconds
const heartbeat = setInterval(() => {
    wss.clients.forEach((ws) => {
      if (ws.isAlive === false) {
        return ws.terminate();
      }
      ws.isAlive = false;
      ws.ping();
    });
  }, 30000);

  wss.on('close', () => {
    clearInterval(heartbeat);
  });

  console.log('✅ WebSocket server initialized');
  return wss;
}


function extractToken(req) {

  const url = new URL(req.url, 'http://localhost');
  const tokenFromQuery = url.searchParams.get('token');
  
  if (tokenFromQuery) {
    return tokenFromQuery;
  }

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  return null;
}


async function handleMessage(ws, data) {
  try {
    const message = JSON.parse(data);
    const { type } = message;

    switch (type) {
      case 'join_room':
        await handleJoinRoom(ws, message);
        break;

      case 'leave_room':
        await handleLeaveRoom(ws, message);
        break;

      case 'send_message':
        await handleSendMessage(ws, message);
        break;

      case 'typing':
        await handleTyping(ws, message);
        break;

      case 'ping':
        ws.send(JSON.stringify({ type: 'pong' }));
        break;

      default:
        ws.send(JSON.stringify({
          type: 'error',
          message: 'Unknown message type'
        }));
    }

  } catch (error) {
    console.error('Error handling message:', error);
    ws.send(JSON.stringify({
      type: 'error',
      message: 'Failed to process message',
      error: error.message
    }));
  }
}


async function handleJoinRoom(ws, message) {
  const { roomId } = message;
  const userId = ws.userId;

  const isMember = await roomMemberRepository.isMember(roomId, userId);
  
  if (!isMember) {
    ws.send(JSON.stringify({
      type: 'error',
      message: 'You are not a member of this room'
    }));
    return;
  }

  if (!roomSubscriptions.has(roomId)) {
    roomSubscriptions.set(roomId, new Set());
  }
  roomSubscriptions.get(roomId).add(userId);

  const messages = await messageRepository.getLatestMessages(roomId, 50);

  ws.send(JSON.stringify({
    type: 'room_joined',
    roomId: roomId,
    messages: messages
  }));

  broadcastToRoom(roomId, userId, {
    type: 'user_joined',
    roomId: roomId,
    userId: userId
  });

  console.log(`User ${userId} joined room ${roomId}`);
}

async function handleLeaveRoom(ws, message) {
  const { roomId } = message;
  const userId = ws.userId;

  if (roomSubscriptions.has(roomId)) {
    roomSubscriptions.get(roomId).delete(userId);
    
    if (roomSubscriptions.get(roomId).size === 0) {
      roomSubscriptions.delete(roomId);
    }
  }

  ws.send(JSON.stringify({
    type: 'room_left',
    roomId: roomId
  }));

  broadcastToRoom(roomId, userId, {
    type: 'user_left',
    roomId: roomId,
    userId: userId
  });

  console.log(`User ${userId} left room ${roomId}`);
}


async function handleSendMessage(ws, message) {
  const { roomId, text } = message;
  const userId = ws.userId;

  if (!roomSubscriptions.has(roomId) || !roomSubscriptions.get(roomId).has(userId)) {
    ws.send(JSON.stringify({
      type: 'error',
      message: 'You must join the room first'
    }));
    return;
  }

  const messageId = await messageRepository.createMessage(roomId, userId, text);
  const savedMessage = await messageRepository.findById(messageId);

  broadcastToRoom(roomId, null, {
    type: 'new_message',
    roomId: roomId,
    message: savedMessage
  });

  console.log(`Message ${messageId} sent to room ${roomId} by user ${userId}`);
}


async function handleTyping(ws, message) {
  const { roomId, isTyping } = message;
  const userId = ws.userId;

  broadcastToRoom(roomId, userId, {
    type: 'typing',
    roomId: roomId,
    userId: userId,
    isTyping: isTyping
  });
}

function broadcastToRoom(roomId, excludeUserId = null, data) {
  if (!roomSubscriptions.has(roomId)) {
    return;
  }

  const userIds = roomSubscriptions.get(roomId);
  
  userIds.forEach((userId) => {
    // Skip sender
    if (userId === excludeUserId) {
      return;
    }

    const client = clients.get(userId);
    if (client && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}

function handleDisconnect(userId) {
    
  roomSubscriptions.forEach((userIds, roomId) => {
    if (userIds.has(userId)) {
      userIds.delete(userId);
      
      broadcastToRoom(roomId, userId, {
        type: 'user_disconnected',
        roomId: roomId,
        userId: userId
      });

      if (userIds.size === 0) {
        roomSubscriptions.delete(roomId);
      }
    }
  });

  clients.delete(userId);

  console.log(`User ${userId} disconnected`);
}


function getRoomOnlineUsers(roomId) {
  if (!roomSubscriptions.has(roomId)) {
    return [];
  }
  return Array.from(roomSubscriptions.get(roomId));
}

module.exports = {
  initWebSocketServer,
  broadcastToRoom,
  getRoomOnlineUsers
};