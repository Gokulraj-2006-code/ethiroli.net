import express from 'express';
import * as controller from '../controllers/taskCollaborationController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();
router.use(authenticate);

// Project task lists
router.get('/projects/:projectId/lists', controller.listTaskLists);
router.post('/projects/:projectId/lists', controller.createTaskList);
router.patch('/lists/:id', controller.updateTaskList);
router.delete('/lists/:id', controller.deleteTaskList);

// Task comments
router.get('/tasks/:taskId/comments', controller.listTaskComments);
router.post('/tasks/:taskId/comments', controller.createTaskComment);
router.delete('/comments/:id', controller.deleteTaskComment);

// Task attachments
router.post('/tasks/:taskId/attachments', controller.createTaskAttachment);
router.delete('/attachments/:id', controller.deleteTaskAttachment);

// Task checklist
router.get('/tasks/:taskId/checklist', controller.listTaskChecklist);
router.post('/tasks/:taskId/checklist', controller.createTaskChecklistItem);
router.patch('/checklist/:id', controller.updateTaskChecklistItem);
router.delete('/checklist/:id', controller.deleteTaskChecklistItem);

// Task reminders
router.get('/tasks/:taskId/reminders', controller.listTaskReminders);
router.post('/tasks/:taskId/reminders', controller.createTaskReminder);
router.delete('/reminders/:id', controller.deleteTaskReminder);

export default router;
