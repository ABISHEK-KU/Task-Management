import Joi from 'joi';

// User validation schemas
const registerSchema = Joi.object({
  username: Joi.string().min(3).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  firstName: Joi.string().required(),
  lastName: Joi.string().required()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

// Task validation schemas
const taskSchema = Joi.object({
  title: Joi.string().max(200).required(),
  description: Joi.string().max(2000).allow(''),
  status: Joi.string().valid('todo', 'in-progress', 'review', 'done'),
  priority: Joi.string().valid('low', 'medium', 'high', 'urgent'),
  dueDate: Joi.date().allow(null),
  tags: Joi.array().items(Joi.string()),
  assignedTo: Joi.string()
});

const updateTaskSchema = Joi.object({
  title: Joi.string().max(200),
  description: Joi.string().max(2000).allow(''),
  status: Joi.string().valid('todo', 'in-progress', 'review', 'done'),
  priority: Joi.string().valid('low', 'medium', 'high', 'urgent'),
  dueDate: Joi.date().allow(null),
  tags: Joi.array().items(Joi.string()),
  assignedTo: Joi.string()
});

const taskQuerySchema = Joi.object({
  status: Joi.string().valid('todo', 'in-progress', 'review', 'done'),
  priority: Joi.string().valid('low', 'medium', 'high', 'urgent'),
  assignedTo: Joi.string(),
  search: Joi.string(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  sortBy: Joi.string().valid('createdAt', 'dueDate', 'priority', 'status').default('createdAt'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

// Comment validation schemas
const commentSchema = Joi.object({
  content: Joi.string().max(1000).required()
});

// Validation middleware
const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    next();
  };
};

const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.query);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    next();
  };
};

export {
  validate,
  validateQuery,
  registerSchema,
  loginSchema,
  taskSchema,
  updateTaskSchema,
  taskQuerySchema,
  commentSchema
};
