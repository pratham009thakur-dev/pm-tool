const express = require('express');
const router = express.Router();
const {
  createProject,
  getUserProjects,
  getProjectById,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
} = require('../controllers/projectController');
const { protect } = require('../middleware/authMiddleware');
const { checkProjectAccess } = require('../middleware/roleMiddleware');

router.use(protect);

router.route('/')
  .post(createProject)
  .get(getUserProjects);

router.route('/:id')
  .get(checkProjectAccess(['Project Owner', 'Project Admin', 'Team Member']), getProjectById)
  .put(checkProjectAccess(['Project Owner', 'Project Admin']), updateProject)
  .delete(checkProjectAccess(['Project Owner']), deleteProject);

router.post('/:id/members', checkProjectAccess(['Project Owner', 'Project Admin']), addMember);
router.delete('/:id/members/:userId', checkProjectAccess(['Project Owner', 'Project Admin']), removeMember);

module.exports = router;