import express from 'express';
import { auth } from '../middleware/auth.js';
import analyticsController from '../controllers/analyticsController.js';

const router = express.Router();

/**
 * @swagger
 * /analytics/overview:
 *   get:
 *     summary: Get task overview statistics
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Overview statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalTasks:
 *                   type: integer
 *                   description: Total number of tasks
 *                 completedTasks:
 *                   type: integer
 *                   description: Number of completed tasks
 *                 pendingTasks:
 *                   type: integer
 *                   description: Number of pending tasks
 *                 overdueTasks:
 *                   type: integer
 *                   description: Number of overdue tasks
 *                 tasksByStatus:
 *                   type: object
 *                   description: Tasks grouped by status
 *                 tasksByPriority:
 *                   type: object
 *                   description: Tasks grouped by priority
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/overview', auth, analyticsController.getOverview);

/**
 * @swagger
 * /analytics/performance:
 *   get:
 *     summary: Get user performance metrics
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Performance metrics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 userMetrics:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       userId:
 *                         type: string
 *                       username:
 *                         type: string
 *                       totalTasks:
 *                         type: integer
 *                       completedTasks:
 *                         type: integer
 *                       completionRate:
 *                         type: number
 *                         format: float
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/performance', auth, analyticsController.getPerformance);

/**
 * @swagger
 * /analytics/trends:
 *   get:
 *     summary: Get task trends over time
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Task trends retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 trends:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       date:
 *                         type: string
 *                         format: date
 *                       created:
 *                         type: integer
 *                       completed:
 *                         type: integer
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/trends', auth, analyticsController.getTrends);

/**
 * @swagger
 * /analytics/export:
 *   get:
 *     summary: Export tasks data
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Tasks data exported successfully
 *         content:
 *           text/csv:
 *             schema:
 *               type: string
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/export', auth, analyticsController.exportTasks);

export default router;
