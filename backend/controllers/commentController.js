import Comment from '../models/Comment.js';
import Task from '../models/Task.js';

// Add comment to task
const addComment = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { content } = req.body;

    // Check if task exists and is not deleted
    const task = await Task.findOne({ _id: taskId, isDeleted: false });
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const comment = new Comment({
      content,
      task: taskId,
      author: req.user._id
    });

    await comment.save();
    await comment.populate('author', 'username firstName lastName');

    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all comments for a task
const getComments = async (req, res) => {
  try {
    const { taskId } = req.params;

    // Check if task exists
    const task = await Task.findOne({ _id: taskId, isDeleted: false });
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const comments = await Comment.find({ task: taskId, isDeleted: false })
      .populate('author', 'username firstName lastName')
      .sort({ createdAt: 1 });

    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Update comment
const updateComment = async (req, res) => {
  try {
    const { content } = req.body;

    const comment = await Comment.findOneAndUpdate(
      { _id: req.params.id, author: req.user._id, isDeleted: false },
      { content },
      { new: true, runValidators: true }
    ).populate('author', 'username firstName lastName');

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found or unauthorized' });
    }

    res.json(comment);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete comment
const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findOneAndUpdate(
      { _id: req.params.id, author: req.user._id, isDeleted: false },
      { isDeleted: true, deletedAt: new Date() },
      { new: true }
    );

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found or unauthorized' });
    }

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export default {
  addComment,
  getComments,
  updateComment,
  deleteComment
};
