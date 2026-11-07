const Activity = require('../models/Activity');

// @desc    Get project activity feed
// @route   GET /api/activities/project/:projectId
const getProjectActivities = async (req, res, next) => {
  try {
    const activities = await Activity.find({ project: req.params.projectId })
      .populate('user', 'name email avatar')
      .populate('task', 'title')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(activities);
  } catch (error) {
    next(error);
  }
};

module.exports = { getProjectActivities };