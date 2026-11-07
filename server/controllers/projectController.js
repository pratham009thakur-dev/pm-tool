const Project = require('../models/Project');
const Task = require('../models/Task');
const Activity = require('../models/Activity');

// @desc    Create new project
// @route   POST /api/projects
const createProject = async (req, res, next) => {
  try {
    const { title, description, startDate, deadline, priority, status } = req.body;
    const project = await Project.create({
      title,
      description,
      startDate,
      deadline,
      priority: priority || 'Medium',
      status: status || 'Planning',
      owner: req.user._id,
      members: [{ user: req.user._id, role: 'Project Owner' }],
    });

    await Activity.create({
      project: project._id,
      user: req.user._id,
      action: 'Project Created',
      details: `Project "${project.title}" was created by ${req.user.name}`,
    });

    res.status(201).json(project);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all projects for current user
// @route   GET /api/projects
const getUserProjects = async (req, res, next) => {
  try {
    const projects = await Project.find({
      $or: [{ owner: req.user._id }, { 'members.user': req.user._id }],
    })
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar')
      .sort({ updatedAt: -1 });

    const projectsWithProgress = await Promise.all(
      projects.map(async (proj) => {
        const totalTasks = await Task.countDocuments({ project: proj._id });
        const completedTasks = await Task.countDocuments({
          project: proj._id,
          status: 'Done',
        });
        const progress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);
        return {
          ...proj.toObject(),
          totalTasks,
          completedTasks,
          progress,
        };
      })
    );

    res.json(projectsWithProgress);
  } catch (error) {
    next(error);
  }
};

// @desc    Get project details by ID
// @route   GET /api/projects/:id
const getProjectById = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar');

    if (!project) return res.status(404).json({ message: 'Project not found' });

    const totalTasks = await Task.countDocuments({ project: project._id });
    const completedTasks = await Task.countDocuments({
      project: project._id,
      status: 'Done',
    });
    const progress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

    res.json({
      ...project.toObject(),
      totalTasks,
      completedTasks,
      progress,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update project details
// @route   PUT /api/projects/:id
const updateProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    project.title = req.body.title || project.title;
    project.description = req.body.description !== undefined ? req.body.description : project.description;
    project.startDate = req.body.startDate || project.startDate;
    project.deadline = req.body.deadline || project.deadline;
    project.status = req.body.status || project.status;
    project.priority = req.body.priority || project.priority;

    const updated = await project.save();

    await Activity.create({
      project: updated._id,
      user: req.user._id,
      action: 'Project Updated',
      details: `Project parameters updated by ${req.user.name}`,
    });

    res.json(updated);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    await Task.deleteMany({ project: project._id });
    await Activity.deleteMany({ project: project._id });
    await project.deleteOne();

    res.json({ message: 'Project and all associated items deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Add member to project
// @route   POST /api/projects/:id/members
const addMember = async (req, res, next) => {
  try {
    const { userId, role } = req.body;
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const exists = project.members.some((m) => m.user.toString() === userId);
    if (exists) {
      return res.status(400).json({ message: 'User is already a project member' });
    }

    project.members.push({ user: userId, role: role || 'Team Member' });
    await project.save();

    await Activity.create({
      project: project._id,
      user: req.user._id,
      action: 'Member Added',
      details: `User added with role ${role || 'Team Member'} by ${req.user.name}`,
    });

    const populated = await Project.findById(project._id)
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar');

    res.json(populated);
  } catch (error) {
    next(error);
  }
};

// @desc    Remove member from project
// @route   DELETE /api/projects/:id/members/:userId
const removeMember = async (req, res, next) => {
  try {
    const { id, userId } = req.params;
    const project = await Project.findById(id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    if (project.owner.toString() === userId) {
      return res.status(400).json({ message: 'Cannot remove the primary project owner' });
    }

    project.members = project.members.filter((m) => m.user.toString() !== userId);
    await project.save();

    await Task.updateMany({ project: id, assignee: userId }, { $set: { assignee: null } });

    await Activity.create({
      project: project._id,
      user: req.user._id,
      action: 'Member Removed',
      details: `Member unassigned from project by ${req.user.name}`,
    });

    const populated = await Project.findById(project._id)
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar');

    res.json(populated);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createProject,
  getUserProjects,
  getProjectById,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
};