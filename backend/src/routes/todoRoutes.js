import express from 'express';
import * as controller from '../controllers/todoController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();
router.use(authenticate);

// Lists
router.get('/summary', controller.getTodoSummary);
router.get('/lists', controller.listTodoLists);
router.post('/lists', controller.createTodoList);
router.get('/lists/:id', controller.getTodoList);
router.put('/lists/:id', controller.updateTodoList);
router.patch('/lists/:id', controller.updateTodoList);
router.delete('/lists/:id', controller.deleteTodoList);
router.post('/lists/:id/share', controller.shareTodoList);
router.delete('/lists/:id/members/:userId', controller.removeTodoListMember);

// Items
router.get('/lists/:id/items', controller.listTodoItems);
router.post('/lists/:id/items', controller.createTodoItem);
router.patch('/items/:id', controller.updateTodoItem);
router.delete('/items/:id', controller.deleteTodoItem);

// Subtasks
router.post('/items/:itemId/subtasks', controller.createTodoSubtask);
router.patch('/subtasks/:id', controller.updateTodoSubtask);
router.delete('/subtasks/:id', controller.deleteTodoSubtask);

// Comments
router.get('/items/:itemId/comments', controller.listTodoComments);
router.post('/items/:itemId/comments', controller.createTodoComment);
router.delete('/comments/:id', controller.deleteTodoComment);

// Attachments
router.post('/items/:itemId/attachments', controller.createTodoAttachment);
router.delete('/attachments/:id', controller.deleteTodoAttachment);

// Reminders
router.get('/items/:itemId/reminders', controller.listTodoReminders);
router.post('/items/:itemId/reminders', controller.createTodoReminder);
router.delete('/reminders/:id', controller.deleteTodoReminder);

export default router;
