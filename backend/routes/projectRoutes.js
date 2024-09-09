const express = require('express');
const {
  createProjectHandler,
  getProjectsHandler,
  getProjectHandler,
  updateProjectHandler,
  deleteProjectHandler,
  getProjectFilesHandler,
  createFileHandler, 
  getFileContentHandler,
  updateFileContentHandler,
  updateFileNameHandler,
  deleteFileHandler,
  shareProjectHandler,
  notifyFileChangeHandler,
} = require('../controllers/projectController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// Authenticated routes for project management
router.post('/add', authMiddleware, createProjectHandler); // Create a new project
router.get('', authMiddleware, getProjectsHandler); // Get all projects for the authenticated user
router.get('/:project_id', authMiddleware, getProjectHandler); // Get a single project by ID
router.put('/edit/:project_id', authMiddleware, updateProjectHandler); // Update project details
router.delete('/:project_id', authMiddleware, deleteProjectHandler); // Delete a project

// File-related routes
router.get('/:project_id/files', authMiddleware, getProjectFilesHandler); // Get all files for a project
router.post('/:project_id/files', authMiddleware, createFileHandler); // Create a new file or folder
router.get('/:project_id/files/*', authMiddleware, getFileContentHandler); // Get the content of a specific file
router.put('/:project_id/files/content/*', authMiddleware, updateFileContentHandler); // Update the content of a specific file
router.put('/:project_id/files/rename/*', authMiddleware, updateFileNameHandler); // Rename a file or folder
router.delete('/:project_id/files/*', authMiddleware, deleteFileHandler); // Delete a file or folder

// Project sharing route
router.post('/:project_id/share', authMiddleware, shareProjectHandler); // Share a project with another user
router.post('/:project_id/notify-file-change', notifyFileChangeHandler);

module.exports = router;
