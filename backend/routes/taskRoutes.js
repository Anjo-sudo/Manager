const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');
const { protect } = require('../middleware/authMiddleware');

// @desc    Get tasks for a project
// @route   GET /api/tasks/project/:projectId
// @access  Private
router.get('/project/:projectId', protect, async (req, res) => {
  try {
    const project = await prisma.project.findUnique({
        where: { id: req.params.projectId },
        include: { members: true }
    });
    
    if (!project) {
        return res.status(404).json({ message: 'Project not found' });
    }

    const isMember = project.members.some(m => m.id === req.user.id);
    if (project.adminId !== req.user.id && !isMember) {
      return res.status(401).json({ message: 'Not authorized to view tasks' });
    }

    const tasks = await prisma.task.findMany({
        where: { projectId: req.params.projectId },
        include: {
            assignedTo: { select: { id: true, name: true, email: true } }
        }
    });

    const mappedTasks = tasks.map(t => ({
        ...t,
        _id: t.id,
        assignedTo: t.assignedTo ? { ...t.assignedTo, _id: t.assignedTo.id } : null
    }));

    res.json(mappedTasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Create a task
// @route   POST /api/tasks
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { title, description, dueDate, priority, projectId, assignedTo } = req.body;

    const project = await prisma.project.findUnique({ where: { id: projectId } });

    if (!project) {
        return res.status(404).json({ message: 'Project not found' });
    }

    if (project.adminId !== req.user.id) {
        return res.status(401).json({ message: 'Only admin can create tasks' });
    }

    const data = {
        title,
        description,
        priority: priority || 'Medium',
        projectId,
    };
    if (dueDate) data.dueDate = new Date(dueDate);
    if (assignedTo) data.assignedToId = assignedTo;

    const task = await prisma.task.create({ data });

    res.status(201).json({ ...task, _id: task.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Update a task
// @route   PUT /api/tasks/:id
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    let task = await prisma.task.findUnique({ where: { id: req.params.id } });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const project = await prisma.project.findUnique({ where: { id: task.projectId } });

    const isAdmin = project.adminId === req.user.id;
    const isAssigned = task.assignedToId === req.user.id;

    if (!isAdmin && !isAssigned) {
        return res.status(401).json({ message: 'Not authorized to update this task' });
    }

    // If member, only allow status update
    if (!isAdmin && isAssigned) {
        task = await prisma.task.update({
            where: { id: req.params.id },
            data: { status: req.body.status || task.status }
        });
        return res.json({ ...task, _id: task.id });
    }

    // Admin full update (simplification for status/priority etc)
    const updateData = {};
    if (req.body.status) updateData.status = req.body.status;
    if (req.body.title) updateData.title = req.body.title;
    if (req.body.description) updateData.description = req.body.description;
    if (req.body.priority) updateData.priority = req.body.priority;
    if (req.body.dueDate) updateData.dueDate = new Date(req.body.dueDate);
    if (req.body.assignedTo !== undefined) updateData.assignedToId = req.body.assignedTo || null;

    task = await prisma.task.update({
        where: { id: req.params.id },
        data: updateData
    });

    res.json({ ...task, _id: task.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const task = await prisma.task.findUnique({ where: { id: req.params.id } });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const project = await prisma.project.findUnique({ where: { id: task.projectId } });

    if (project.adminId !== req.user.id) {
        return res.status(401).json({ message: 'Only admin can delete tasks' });
    }

    await prisma.task.delete({ where: { id: req.params.id } });

    res.json({ id: req.params.id, _id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
