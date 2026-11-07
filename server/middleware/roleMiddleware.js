const Project = require('../models/Project');

const checkProjectAccess = (allowedRoles = ['Project Owner', 'Project Admin', 'Team Member']) => {
  return async (req, res, next) => {
    try {
      const projectId = req.params.projectId || req.body.projectId || req.params.id;
      if (!projectId) {
        return res.status(400).json({ message: 'Project ID is required' });
      }

      const project = await Project.findById(projectId);
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }

      const isOwner = project.owner.toString() === req.user._id.toString();
      const memberRecord = project.members.find(
        (m) => m.user.toString() === req.user._id.toString()
      );

      if (!isOwner && !memberRecord) {
        return res.status(403).json({ message: 'Access denied: not a member of this project' });
      }

      const userRole = isOwner ? 'Project Owner' : memberRecord.role;

      if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({
          message: `Forbidden: requires one of the following roles: ${allowedRoles.join(', ')}`,
        });
      }

      req.project = project;
      req.projectRole = userRole;
      next();
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  };
};

module.exports = { checkProjectAccess };