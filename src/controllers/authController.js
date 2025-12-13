const userRepository = require('../repositories/userRepository');
const { generateToken } = require('../utils/jwt');

const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Checking if email already exists
    const existingEmail = await userRepository.findByEmail(email);
    if (existingEmail) {
      return res.status(409).json({
        success: false,
        message: 'Email already registered'
      });
    }
    
    // Checking if username already exists
    const existingUsername = await userRepository.findByUsername(username);
    if (existingUsername) {
      return res.status(409).json({
        success: false,
        message: 'Username already taken'
      });
    }
    
    // Creating user
    const userId = await userRepository.createUser(username, email, password);
    
    // Getting created user
    const user = await userRepository.findById(userId);
    const safeUser = userRepository.getSafeUser(user);
    
    // Generating JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      username: user.username
    });
    
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: safeUser,
        token
      }
    });
    
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await userRepository.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
    
    const isValidPassword = await userRepository.comparePassword(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
    
    const token = generateToken({
      userId: user.id,
      email: user.email,
      username: user.username
    });
    
    const safeUser = userRepository.getSafeUser(user);
    
    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: safeUser,
        token
      }
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
};

const getProfile = async (req, res) => {
  try {
    
    const user = await userRepository.findById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    const safeUser = userRepository.getSafeUser(user);
    
    res.status(200).json({
      success: true,
      data: {
        user: safeUser
      }
    });
    
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get profile',
      error: error.message
    });
  }
};

const getAllProfiles = async (req, res) => {
  try {

    const users = await userRepository.findAll();

    if (!users) {
      return res.status(404).json({
        success: false,
        message: 'Users not found'
      });
    }

    const safeUsers = users.map(user => userRepository.getSafeUser(user));

    res.status(200).json({
      success: true,
      data: {
        user: safeUsers
      }
    });
    
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get profile',
      error: error.message
    });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  getAllProfiles
};
