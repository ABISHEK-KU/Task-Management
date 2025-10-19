import Task from '../models/Task.js';
import User from '../models/User.js';

// Get task overview statistics
const getOverview = async (req, res) => {
  try {
    const matchFilter = { isDeleted: false };

    // Get counts by status
    const statusStats = await Task.aggregate([
      { $match: matchFilter },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Get counts by priority
    const priorityStats = await Task.aggregate([
      { $match: matchFilter },
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ]);

    // Get overdue tasks
    const overdueTasks = await Task.countDocuments({
      ...matchFilter,
      dueDate: { $lt: new Date() },
      status: { $ne: 'done' }
    });

    // Convert status stats to expected format
    const statusMap = statusStats.reduce((acc, stat) => {
      acc[stat._id] = stat.count;
      return acc;
    }, {});

    res.json({
      totalTasks: statusStats.reduce((sum, stat) => sum + stat.count, 0),
      completedTasks: statusMap.done || 0,
      pendingTasks: statusMap.todo || 0,
      inProgressTasks: statusMap['in-progress'] || 0,
      overdueTasks: overdueTasks
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get user performance metrics
const getPerformance = async (req, res) => {
  try {
    // Get all users for performance metrics
    const users = await User.find({}, 'username firstName lastName');

    const performanceData = await Promise.all(
      users.map(async (user) => {
        // Tasks created by user
        const createdTasks = await Task.countDocuments({ createdBy: user._id, isDeleted: false });

        // Tasks assigned to user
        const assignedTasks = await Task.countDocuments({ assignedTo: user._id, isDeleted: false });

        // Completed tasks
        const completedTasks = await Task.countDocuments({
          assignedTo: user._id,
          status: 'done',
          isDeleted: false
        });

        // Average completion time (simplified)
        const avgCompletionTime = await Task.aggregate([
          { $match: { assignedTo: user._id, status: 'done', isDeleted: false } },
          {
            $project: {
              duration: { $subtract: ['$updatedAt', '$createdAt'] }
            }
          },
          {
            $group: {
              _id: null,
              avgDuration: { $avg: '$duration' }
            }
          }
        ]);

        return {
          userId: user._id,
          username: user.username,
          totalTasks: assignedTasks,
          completedTasks: completedTasks,
          completionRate: assignedTasks > 0 ? (completedTasks / assignedTasks) * 100 : 0,
          averageCompletionTime: avgCompletionTime.length > 0 ? avgCompletionTime[0].avgDuration / (1000 * 60 * 60 * 24) : 0 // in days
        };
      })
    );

    res.json(performanceData);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get task trends over time
const getTrends = async (req, res) => {
  try {
    const { period = 'month' } = req.query; // day, week, month

    const matchFilter = { isDeleted: false };

    let groupBy;
    switch (period) {
      case 'day':
        groupBy = { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } };
        break;
      case 'week':
        groupBy = { $dateToString: { format: '%Y-%U', date: '$createdAt' } };
        break;
      case 'month':
      default:
        groupBy = { $dateToString: { format: '%Y-%m', date: '$createdAt' } };
        break;
    }

    const trends = await Task.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: groupBy,
          created: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'done'] }, 1, 0] }
          }
        }
      },
      { $project: { _id: 0, date: '$_id', created: 1, completed: 1 } },
      { $sort: { date: 1 } }
    ]);

    res.json(trends);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Export tasks data
const exportTasks = async (req, res) => {
  try {
    const userId = req.user._id;
    const isAdmin = req.user.role === 'admin';
    const { format = 'json' } = req.query;

    const matchFilter = isAdmin
      ? { isDeleted: false }
      : { isDeleted: false, $or: [{ createdBy: userId }, { assignedTo: userId }] };

    const tasks = await Task.find(matchFilter)
      .populate('assignedTo', 'username firstName lastName')
      .populate('createdBy', 'username firstName lastName')
      .sort({ createdAt: -1 });

    if (format === 'csv') {
      // Simple CSV export
      const csvData = tasks.map(task => ({
        id: task._id,
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate,
        assignedTo: task.assignedTo ? `${task.assignedTo.firstName} ${task.assignedTo.lastName}` : '',
        createdBy: `${task.createdBy.firstName} ${task.createdBy.lastName}`,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt
      }));

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="tasks.csv"');

      // Convert to CSV string (simplified)
      const csvString = [
        Object.keys(csvData[0]).join(','),
        ...csvData.map(row => Object.values(row).join(','))
      ].join('\n');

      res.send(csvString);
    } else {
      res.json(tasks);
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export default {
  getOverview,
  getPerformance,
  getTrends,
  exportTasks
};
