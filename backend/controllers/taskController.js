import Task from '../models/Task.js';
import mongoose from 'mongoose';

// Create new task
const createTask = async (req, res) => {
  try {
    const taskData = { ...req.body, createdBy: req.user.id };
    if (taskData.assignedTo && !mongoose.Types.ObjectId.isValid(taskData.assignedTo)) {
      return res.status(400).json({ message: 'Invalid assignedTo ID' });
    }
    const task = new Task(taskData);
    await task.save();
    await task.populate('assignedTo', 'username firstName lastName');
    await task.populate('createdBy', 'username firstName lastName');
    console.log('Task created successfully');
    res.status(201).json(task);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Bulk create tasks
const bulkCreateTasks = async (req, res) => {
  try {
    const { tasks } = req.body;
    if (!Array.isArray(tasks) || tasks.length === 0) {
      return res.status(400).json({ message: 'Tasks array is required' });
    }

    const createdTasks = [];
    for (const taskData of tasks) {
      const data = { ...taskData, createdBy: req.user.id };
      if (data.assignedTo && !mongoose.Types.ObjectId.isValid(data.assignedTo)) {
        return res.status(400).json({ message: 'Invalid assignedTo ID in bulk tasks' });
      }
      const task = new Task(data);
      await task.save();
      await task.populate('assignedTo', 'username firstName lastName');
      await task.populate('createdBy', 'username firstName lastName');
      createdTasks.push(task);
    }

    console.log('Bulk tasks created successfully');
    res.status(201).json(createdTasks);
  } catch (error) {
    console.error('Error creating bulk tasks:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all tasks with filtering, searching, sorting, pagination
const getTasks = async (req, res) => {
  try {
    const { status, priority, assignedTo, search, page, limit, sortBy, sortOrder } = req.query;

    let query = { isDeleted: false };

    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (assignedTo) query.assignedTo = assignedTo;

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const tasks = await Task.find(query)
      .populate('assignedTo', 'username firstName lastName')
      .populate('createdBy', 'username firstName lastName')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Task.countDocuments(query);

    console.log('Tasks retrieved successfully');
    res.json({
      tasks,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error retrieving tasks:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get single task by ID
const getTaskById = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, isDeleted: false })
      .populate('assignedTo', 'username firstName lastName')
      .populate('createdBy', 'username firstName lastName');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    console.log('Task retrieved successfully');
    res.json(task);
  } catch (error) {
    console.error('Error retrieving task:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update task
const updateTask = async (req, res) => {
  try {
    const taskId = req.params.id;
    const updateData = req.body;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      return res.status(400).json({ message: 'Invalid task ID' });
    }

    // Check if assignedTo is provided and valid
    if (updateData.assignedTo && !mongoose.Types.ObjectId.isValid(updateData.assignedTo)) {
      return res.status(400).json({ message: 'Invalid assignedTo ID' });
    }

    // Find and update the task
    const task = await Task.findOneAndUpdate(
      { _id: taskId, isDeleted: false },
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate('assignedTo', 'username firstName lastName')
     .populate('createdBy', 'username firstName lastName');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    console.log('Task updated successfully');
    res.json(task);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete task (soft delete)
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      { isDeleted: true, deletedAt: new Date() },
      { new: true }
    );

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    console.log('Task deleted successfully');
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export default {
  createTask,
  bulkCreateTasks,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask
};
