const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');
const { protect } = require('../middleware/authMiddleware');

// @desc    Get dashboard metrics
// @route   GET /api/dashboard
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    // Find all projects the user is part of
    const projects = await prisma.project.findMany({
      where: {
        OR: [
          { adminId: req.user.id },
          { members: { some: { id: req.user.id } } }
        ]
      },
      select: { id: true }
    });

    const projectIds = projects.map(p => p.id);

    // Find all tasks in these projects
    const tasks = await prisma.task.findMany({
        where: { projectId: { in: projectIds } }
    });

    // Metrics
    const totalTasks = tasks.length;
    const tasksByStatus = {
        'To Do': tasks.filter(t => t.status === 'To Do').length,
        'In Progress': tasks.filter(t => t.status === 'In Progress').length,
        'Done': tasks.filter(t => t.status === 'Done').length,
    };

    // Overdue tasks
    const now = new Date();
    const overdueTasks = tasks.filter(t => t.dueDate && new Date(t.dueDate) < now && t.status !== 'Done').length;

    // Assigned to me
    const myTasks = tasks.filter(t => t.assignedToId === req.user.id).length;

    res.json({
        totalTasks,
        tasksByStatus,
        overdueTasks,
        myTasks
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
