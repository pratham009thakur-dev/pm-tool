const Comment = require('../models/Comment');
const Task = require('../models/Task');
const Activity = require('../models/Activity');

// @desc    Add comment to task
// @route   POST /api/comments
const addComment = async (req, res, next) => {
  try {
    const { taskId, text } = req.body;
    if (!taskId || !text) {
      return res.status(400).json({ message: 'TaskId and comment text are required' });
    }

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const comment = await Comment.create({
      task: taskId,
      user: req.user._id,
      text,
    });

    await Activity.create({
      project: task.project,
      task: task._id,
      user: req.user._id,
      action: 'Comment Added',
      details: `${req.user.name} commented on "${task.title}"`,
    });

    const populated = await Comment.findById(comment._id).populate('user', 'name email avatar');
    res.status(201).json(populated);
  } catch (error) {
    next(error);
  }
};

// @desc    Get comments for task
// @route   GET /api/comments/task/:taskId
const getTaskComments = async (req, res, next) => {
  try {
    const comments = await Comment.find({ task: req.params.taskId })
      .populate('user', 'name email avatar')
      .sort({ createdAt: 1 });

    res.json(comments);
  } catch (error) {
    next(error);
  }
};

module.exports = { addComment, getTaskComments };