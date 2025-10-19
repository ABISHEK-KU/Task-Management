import express from 'express';
import { auth } from '../middleware/auth.js';
import userController from '../controllers/userController.js';

const router = express.Router();

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users for assignment
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       username:
 *                         type: string
 *                       email:
 *                         type: string
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/', auth, userController.getUsers);

export default router;
