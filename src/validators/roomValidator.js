const Joi = require('joi');

const createRoomSchema = Joi.object({
  name: Joi.string()
    .min(1)
    .max(100)
    .required()
    .messages({
      'string.min': 'Room name cannot be empty',
      'string.max': 'Room name cannot exceed 100 characters',
      'any.required': 'Room name is required'
    })
});


const updateRoomSchema = Joi.object({
  name: Joi.string()
    .min(1)
    .max(100)
    .required()
    .messages({
      'string.min': 'Room name cannot be empty',
      'string.max': 'Room name cannot exceed 100 characters',
      'any.required': 'Room name is required'
    })
});


const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    
    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path[0],
        message: detail.message
      }));
      
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }
    
    next();
  };
};

module.exports = {
  validateCreateRoom: validate(createRoomSchema),
  validateUpdateRoom: validate(updateRoomSchema)
};