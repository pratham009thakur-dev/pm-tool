const mongoose = require('mongoose');
const Project = require('../models/Project');
const Task = require('../models/Task');

// @desc    Get high level dashboard statistics across user projects
// @route   GET /api/analytics/dashboard
const getDashboardStats = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const userProjects = await Project.find({
      $or: [{ owner: userId }, { 'members.user': userId }],
    }).select('_id');

    const projectIds = userProjects.map((p) => p._id);

    const totalProjects = projectIds.length;
    const totalTasks = await Task.countDocuments({ project: { $in: projectIds } });
    const completedTasks = await Task.countDocuments({
      project: { $in: projectIds },
      status: 'Done',
    });
    const inProgressTasks = await Task.countDocuments({
      project: { $in: projectIds },
      status: 'In Progress',
    });
    const pendingTasks = await Task.countDocuments({
      project: { $in: projectIds },
      status: { $in: ['Backlog', 'To Do', 'In Review'] },
    });
    const overdueTasks = await Task.countDocuments({
      project: { $in: projectIds },
      dueDate: { $lt: new Date() },
      status: { $ne: 'Done' },
    });

    const overallCompletionRate = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

    // Group by status
    const statusAgg = await Task.aggregate([
      { $match: { project: { $in: projectIds } } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    // Group by priority
    const priorityAgg = await Task.aggregate([
      { $match: { project: { $in: projectIds } } },
      { $group: { _id: '$priority', count: { $sum: 1 } } },
    ]);

    res.json({
      totalProjects,
      totalTasks,
      completedTasks,
      inProgressTasks,
      pendingTasks,
      overdueTasks,
      overallCompletionRate,
      statusDistribution: statusAgg.map((s) => ({ name: s._id, count: s.count })),
      priorityDistribution: priorityAgg.map((p) => ({ name: p._id, count: p.count })),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get detailed analytics for a specific project
// @route   GET /api/analytics/project/:projectId
const getProjectAnalytics = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const pId = new mongoose.Types.ObjectId(projectId);

    const totalTasks = await Task.countDocuments({ project: pId });
    const completedTasks = await Task.countDocuments({ project: pId, status: 'Done' });
    const inProgressTasks = await Task.countDocuments({ project: pId, status: 'In Progress' });
    const overdueTasks = await Task.countDocuments({
      project: pId,
      dueDate: { $lt: new Date() },
      status: { $ne: 'Done' },
    });
    const completionRate = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

    const statusBreakdown = await Task.aggregate([
      { $match: { project: pId } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const priorityBreakdown = await Task.aggregate([
      { $match: { project: pId } },
      { $group: { _id: '$priority', count: { $sum: 1 } } },
    ]);

    // Team member workload
    const memberWorkload = await Task.aggregate([
      { $match: { project: pId, assignee: { $ne: null } } },
      {
        $group: {
          _id: '$assignee',
          total: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'Done'] }, 1, 0] },
          },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      {
        $project: {
          name: '$user.name',
          total: 1,
          completed: 1,
          pending: { $subtract: ['$total', '$completed'] },
        },
      },
    ]);

    // Monthly trends (based on updatedAt for completed tasks)
    const monthlyCompletion = await Task.aggregate([
      { $match: { project: pId, status: 'Done' } },
      {
        $group: {
          _id: {
            year: { $year: '$updatedAt' },
            month: { $month: '$updatedAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const monthNames = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const trendData = monthlyCompletion.map((item) => ({
      month: `${monthNames[item._id.month]} ${item._id.year}`,
      completed: item.count,
    }));

    res.json({
      totalTasks,
      completedTasks,
      inProgressTasks,
      overdueTasks,
      completionRate,
      statusBreakdown: statusBreakdown.map((s) => ({ name: s._id, count: s.count })),
      priorityBreakdown: priorityBreakdown.map((p) => ({ name: p._id, count: p.count })),
      memberWorkload,
      trends: trendData,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboardStats, getProjectAnalytics };