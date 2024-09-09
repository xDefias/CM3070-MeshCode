const pool = require('../config/db');

// Create a new project and store the container ID
async function createProject(name, description, ownerId, containerId = null) {
  if (!name || !ownerId) {
    throw new Error('Name and ownerId are required');
  }

  const [result] = await pool.query(
    'INSERT INTO projects (name, description, owner_id, container_id) VALUES (?, ?, ?, ?)',
    [name, description, ownerId, containerId]
  );
  //console.log('createProject insertId:', result.insertId)
  return result.insertId;
}

// Get all projects by a specific owner
async function getProjectsByOwnerId(ownerId) {
  if (!ownerId) {
    throw new Error('ownerId is required');
  }

  const [rows] = await pool.query('SELECT * FROM projects WHERE owner_id = ?', [ownerId]);
  return rows;
}

// Get shared projects
async function getSharedProjects(userId) {
  if (!userId) {
    throw new Error('userId is required');
  }

  const [rows] = await pool.query(
    `SELECT p.* FROM projects p
     JOIN project_collaborators pc ON p.id = pc.project_id
     WHERE pc.user_id = ?`,
    [userId]
  );
  return rows;
}

// Get project details by ID
async function getProjectDetailsById(project_id) {
  if (!project_id) {
    throw new Error('project_id is required');
  }

  const [rows] = await pool.query('SELECT * FROM projects WHERE id = ?', [project_id]);
  return rows[0];
}

// Update project details
async function updateProject(project_id, { name, description, containerId }) {
  if (!project_id) {
    throw new Error('project_id is required');
  }

  const updateFields = [];
  const updateValues = [];

  if (name) {
    updateFields.push('name = ?');
    updateValues.push(name);
  }
  if (description) {
    updateFields.push('description = ?');
    updateValues.push(description);
  }
  if (containerId) {
    updateFields.push('container_id = ?');
    updateValues.push(containerId);
  }

  updateValues.push(project_id);

  const [result] = await pool.query(
    `UPDATE projects SET ${updateFields.join(', ')} WHERE id = ?`,
    updateValues
  );

  if (result.affectedRows === 0) {
    return null;
  }

  return getProjectDetailsById(project_id);
}

// Delete a project
async function deleteProject(project_id) {
  if (!project_id) {
    throw new Error('project_id is required');
  }

  const [result] = await pool.query('DELETE FROM projects WHERE id = ?', [project_id]);
  return result.affectedRows > 0;
}

// Share a project with another user
async function shareProject(project_id, userId) {
  try {
    if (!project_id || !userId) {
      throw new Error('Both project_id and userId are required');
    }

    // Check if the project exists
    const [projectExists] = await pool.query('SELECT id FROM projects WHERE id = ?', [project_id]);
    if (!projectExists.length) {
      throw new Error('Invalid project_id: Project not found');
    }

    // Check if the user exists
    const [userExists] = await pool.query('SELECT id FROM users WHERE id = ?', [userId]);
    if (!userExists.length) {
      throw new Error('Invalid userId: User not found');
    }

    // Check if the user is already a collaborator
    const [existingCollab] = await pool.query(
      'SELECT project_id, user_id FROM project_collaborators WHERE project_id = ? AND user_id = ?',
      [project_id, userId]
    );

    if (existingCollab.length) {
      throw new Error('User is already a collaborator on this project');
    }

    // Insert new collaborator
    const [result] = await pool.query(
      'INSERT INTO project_collaborators (project_id, user_id, role) VALUES (?, ?, ?)',
      [project_id, userId, 'viewer']
    );

    // Return true if insert was successful
    return result.affectedRows > 0;
  } catch (error) {
    // Propagate the error to the calling function
    throw error;
  }
}

module.exports = {
  createProject,
  getProjectsByOwnerId,
  getProjectDetailsById,
  updateProject,
  deleteProject,
  shareProject,
  getSharedProjects,
};
