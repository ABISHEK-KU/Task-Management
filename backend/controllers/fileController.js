import path from 'path';
import fs from 'fs';
import File from '../models/File.js';
import Task from '../models/Task.js';

// Upload files (multiple files per task)
const uploadFiles = async (req, res) => {
  try {
    const { taskId } = req.params;

    // Check if task exists and is not deleted
    const task = await Task.findOne({ _id: taskId, isDeleted: false });
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const uploadedFiles = [];

    for (const file of req.files) {
      const fileDoc = new File({
        filename: file.filename,
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        path: file.path,
        task: taskId,
        uploadedBy: req.user._id
      });

      await fileDoc.save();
      await fileDoc.populate('uploadedBy', 'username firstName lastName');
      uploadedFiles.push(fileDoc);
    }

    res.status(201).json(uploadedFiles);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get/download file
const downloadFile = async (req, res) => {
  try {
    const file = await File.findOne({ _id: req.params.id, isDeleted: false })
      .populate('task')
      .populate('uploadedBy', 'username firstName lastName');

    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Check if user has access to the task
    if (file.task.createdBy.toString() !== req.user._id.toString() &&
        file.task.assignedTo?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (!fs.existsSync(file.path)) {
      return res.status(404).json({ message: 'File not found on disk' });
    }

    res.setHeader('Content-Type', file.mimetype);
    res.setHeader('Content-Disposition', `attachment; filename="${file.originalName}"`);

    const fileStream = fs.createReadStream(file.path);
    fileStream.pipe(res);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get files for a task
const getFilesForTask = async (req, res) => {
  try {
    const { taskId } = req.params;

    // Check if task exists
    const task = await Task.findOne({ _id: taskId, isDeleted: false });
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const files = await File.find({ task: taskId, isDeleted: false })
      .populate('uploadedBy', 'username firstName lastName')
      .sort({ createdAt: -1 });

    res.json(files);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete file
const deleteFile = async (req, res) => {
  try {
    const file = await File.findOne({ _id: req.params.id, isDeleted: false })
      .populate('task');

    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Check if user is the uploader or task creator
    if (file.uploadedBy.toString() !== req.user._id.toString() &&
        file.task.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Soft delete
    file.isDeleted = true;
    file.deletedAt = new Date();
    await file.save();

    // Optionally delete from disk
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }

    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export default {
  uploadFiles,
  downloadFile,
  getFilesForTask,
  deleteFile
};
