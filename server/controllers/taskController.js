const Task = require('../models/Task');
const Activity = require('../models/Activity');
const Comment = require('../models/Comment');

// @desc    Create a new task
// @route   POST /api/tasks
const createTask = async (req, res, next) => {
  try {
    const { title, description, project, assignee, priority, status, startDate, dueDate, tags } = req.body;
    
    const task = await Task.create({
      title,
      description,
      project,
      assignee: assignee || null,
      priority: priority || 'Medium',
      status: status || 'To Do',
      startDate: startDate || new Date(),
      dueDate,
      tags: Array.isArray(tags) ? tags : [],
    });

    await Activity.create({
      project,
      task: task._id,
      user: req.user._id,
      action: 'Task Created',
      details: `Created task "${task.title}"`,
    });

    const populatedTask = await Task.findById(task._id).populate('assignee', 'name email avatar');
    res.status(201).json(populatedTask);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all tasks for a project with optional filters
// @route   GET /api/tasks/project/:projectId
const getProjectTasks = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { assignee, priority, status, search } = req.query;

    let filter = { project: projectId };

    if (assignee) filter.assignee = assignee;
    if (priority) filter.priority = priority;
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const tasks = await Task.find(filter)
      .populate('assignee', 'name email avatar')
      .sort({ order: 1, createdAt: -1 });

    res.json(tasks);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single task details
// @route   GET /api/tasks/:id
const getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignee', 'name email avatar')
      .populate('project', 'title status members');

    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json(task);
  } catch (error) {
    next(error);
  }
};

// @desc    Update task details
// @route   PUT /api/tasks/:id
const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const previousStatus = task.status;
    const previousAssignee = task.assignee ? task.assignee.toString() : null;

    Object.assign(task, req.body);
    const updatedTask = await task.save();

    if (req.body.status && req.body.status !== previousStatus) {
      await Activity.create({
        project: task.project,
        task: task._id,
        user: req.user._id,
        action: 'Status Changed',
        details: `Task "${task.title}" moved from ${previousStatus} to ${req.body.status}`,
      });
    }

    if (req.body.assignee && req.body.assignee !== previousAssignee) {
      await Activity.create({
        project: task.project,
        task: task._id,
        user: req.user._id,
        action: 'Task Reassigned',
        details: `Task "${task.title}" reassigned`,
      });
    }

    const populated = await Task.findById(updatedTask._id).populate('assignee', 'name email avatar');
    res.json(populated);
  } catch (error) {
    next(error);
  }
};

// @desc    Update task status specifically (for Kanban drag & drop)
// @route   PATCH /api/tasks/:id/status
const updateTaskStatus = async (req, res, next) => {
  try {
    const { status, order } = req.body;
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const oldStatus = task.status;
    task.status = status || task.status;
    if (order !== undefined) task.order = order;

    await task.save();

    if (status && status !== oldStatus) {
      await Activity.create({
        project: task.project,
        task: task._id,
        user: req.user._id,
        action: 'Kanban Move',
        details: `Shifted "${task.title}" to [${status}]`,
      });
    }

    const populated = await Task.findById(task._id).populate('assignee', 'name email avatar');
    res.json(populated);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    await Comment.deleteMany({ task: task._id });
    await Activity.create({
      project: task.project,
      user: req.user._id,
      action: 'Task Deleted',
      details: `Task "${task.title}" was deleted`,
    });

    await task.deleteOne();
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTask,
  getProjectTasks,
  getTaskById,
  updateTask,
  updateTaskStatus,
  deleteTask,
};