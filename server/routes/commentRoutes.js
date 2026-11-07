const express = require('express');
const router = express.Router();
const { addComment, getTaskComments } = require('../controllers/commentController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/', addComment);
router.get('/task/:taskId', getTaskComments);

module.exports = router;