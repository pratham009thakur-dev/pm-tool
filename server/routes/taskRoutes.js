const express = require('express');
const router = express.Router();
const {
  createTask,
  getProjectTasks,
  getTaskById,
  updateTask,
  updateTaskStatus,
  deleteTask,
} = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/', createTask);
router.get('/project/:projectId', getProjectTasks);
router.route('/:id')
  .get(getTaskById)
  .put(updateTask)
  .delete(deleteTask);
router.patch('/:id/status', updateTaskStatus);

module.exports = router;