const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');
const { protect } = require('../middleware/authMiddleware');

// @desc    Get all projects for a user
// @route   GET /api/projects
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      where: {
        OR: [
          { adminId: req.user.id },
          { members: { some: { id: req.user.id } } }
        ]
      },
      include: {
        admin: { select: { id: true, name: true, email: true } },
        members: { select: { id: true, name: true, email: true } }
      }
    });

    // Map `id` to `_id` to maintain compatibility with frontend
    const mappedProjects = projects.map(p => ({
        ...p,
        _id: p.id,
        admin: { ...p.admin, _id: p.admin.id },
        members: p.members.map(m => ({ ...m, _id: m.id }))
    }));

    res.json(mappedProjects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Create a project
// @route   POST /api/projects
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Please add a name field' });
    }

    const project = await prisma.project.create({
      data: {
        name,
        description,
        adminId: req.user.id,
        members: {
            connect: [{ id: req.user.id }]
        }
      }
    });

    res.status(201).json({ ...project, _id: project.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
      include: {
        admin: { select: { id: true, name: true, email: true } },
        members: { select: { id: true, name: true, email: true } }
      }
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json({
        ...project,
        _id: project.id,
        admin: { ...project.admin, _id: project.admin.id },
        members: project.members.map(m => ({ ...m, _id: m.id }))
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Add member to project
// @route   POST /api/projects/:id/members
// @access  Private
router.post('/:id/members', protect, async (req, res) => {
  try {
    const { email } = req.body;
    
    const project = await prisma.project.findUnique({
        where: { id: req.params.id },
        include: { members: true }
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Only admin can add members
    if (project.adminId !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    const userToAdd = await prisma.user.findUnique({ where: { email } });
    if (!userToAdd) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (project.members.some(m => m.id === userToAdd.id)) {
      return res.status(400).json({ message: 'User already in project' });
    }

    const updatedProject = await prisma.project.update({
        where: { id: req.params.id },
        data: {
            members: {
                connect: [{ id: userToAdd.id }]
            }
        }
    });

    res.json({ ...updatedProject, _id: updatedProject.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Delete a project
// @route   DELETE /api/projects/:id
// @access  Private (Admin only)
router.delete('/:id', protect, async (req, res) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: req.params.id }
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Only admin can delete the project
    if (project.adminId !== req.user.id) {
      return res.status(401).json({ message: 'Only the project admin can delete this project' });
    }

    // Delete all tasks first (cascade), then the project
    await prisma.task.deleteMany({ where: { projectId: req.params.id } });
    await prisma.project.delete({ where: { id: req.params.id } });

    res.json({ id: req.params.id, message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
