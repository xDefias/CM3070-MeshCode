const Docker = require('dockerode');
const {
  createProject,
  getProjectsByOwnerId,
  getProjectDetailsById,
  updateProject,
  deleteProject,
  shareProject,
  getSharedProjects,
} = require('../models/projectModel');
const { getUserByUsername } = require('../models/userModel')
const createResponse = require('../utils/response');

const docker = new Docker();

async function createProjectHandler(req, res) {
  const { name, description, userId } = req.body;

  try {
    //console.log('Starting project creation process...');
    const sanitizedProjectName = name.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9_-]/g, '');

    // Create the project entry in the database (without container_id)
    const project_id = await createProject(name, description, userId, null);
    //console.log(`Project created in database with ID: ${project_id}`);

    // Create the Docker container with project_id as an environment variable
    const container = await docker.createContainer({
      Image: 'meshcodedocker',
      Tty: true,
      Cmd: ['/bin/bash'],
      name: `project-${sanitizedProjectName}-${Date.now()}`,
      Env: [`PROJECT_ID=${project_id}`],
    });
    //console.log(`Docker container created for project ID: ${project_id}`);

    // Start the container and get the containerId
    await container.start();
    const containerId = container.id;
    //console.log(`Docker container started with ID: ${containerId}`);

    // Update the project entry with the containerId
    await updateProject(project_id, { containerId });
    //console.log(`Project updated in database with container ID: ${containerId}`);

    // Return the response with the project_id and containerId
    res.status(201).json(createResponse(true, { project_id, containerId }, null));
    //console.log('Project creation process completed successfully.');
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json(createResponse(false, {}, error));
  }
}

async function getProjectsHandler(req, res) {
  const { userId } = req.query;

  try {
    //console.log(`Fetching projects for user ID: ${userId}`);
    const ownedProjects = await getProjectsByOwnerId(userId);
    const sharedProjects = await getSharedProjects(userId);

    const projects = [...ownedProjects, ...sharedProjects];
    res.status(200).json(createResponse(true, { projects }, null));
    //console.log('Projects fetched successfully.');
  } catch (error) {
    console.error('Error getting projects:', error);
    res.status(500).json(createResponse(false, {}, error));
  }
}

async function getProjectHandler(req, res) {
  const { project_id } = req.params;

  try {
    //console.log(`Fetching details for project ID: ${project_id}`);
    const project = await getProjectDetailsById(project_id);
    if (!project) {
      //console.log('Project not found.');
      return res.status(404).json(createResponse(false, {}, 'Project not found'));
    }

    res.status(200).json(createResponse(true, { project }, null));
    //console.log('Project details fetched successfully.');
  } catch (error) {
    console.error('Error getting project details:', error);
    res.status(500).json(createResponse(false, {}, error));
  }
}

async function updateProjectHandler(req, res) {
  const { project_id } = req.params;
  const { name, description, containerId } = req.body;

  try {
    //console.log(`Updating project ID: ${project_id}`);
    const updatedProject = await updateProject(project_id, { name, description, containerId });
    if (!updatedProject) {
      //console.log('Project not found.');
      return res.status(404).json(createResponse(false, {}, 'Project not found'));
    }

    res.status(200).json(createResponse(true, { updatedProject }, null));
    //console.log('Project updated successfully.');
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json(createResponse(false, {}, error));
  }
}

async function deleteProjectHandler(req, res) {
  const { project_id } = req.params;

  try {
    //console.log(`Deleting project ID: ${project_id}`);
    const project = await getProjectDetailsById(project_id);
    if (!project) {
      //console.log('Project not found.');
      return res.status(404).json(createResponse(false, {}, 'Project not found'));
    }

    const container = docker.getContainer(project.container_id);
    await container.stop();
    //console.log(`Docker container stopped for project ID: ${project_id}`);
    await container.remove();
    //console.log(`Docker container removed for project ID: ${project_id}`);

    const success = await deleteProject(project_id);
    if (!success) {
      //console.log('Project not found during deletion.');
      return res.status(404).json(createResponse(false, {}, 'Project not found'));
    }

    res.status(200).json(createResponse(true, {}, null));
    //console.log('Project deleted successfully.');
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json(createResponse(false, {}, error));
  }
}

async function getProjectFilesHandler(req, res) {
  const { project_id } = req.params;

  try {
    //console.log(`Fetching files for project ID: ${project_id}`);
    const project = await getProjectDetailsById(project_id);
    if (!project) {
      //console.log('Project not found.');
      return res.status(404).json(createResponse(false, {}, 'Project not found'));
    }

    const container = docker.getContainer(project.container_id);

    const exec = await container.exec({
      Cmd: ['find', '/project', '-type', 'f', '-o', '-type', 'd'],
      AttachStdout: true,
      AttachStderr: true,
    });

    let output = '';
    exec.start((err, stream) => {
      if (err) {
        console.error('Error listing files in container:', err);
        return res.status(500).json(createResponse(false, {}, 'Error listing files in container'));
      }

      stream.on('data', (data) => {
        output += data.toString('utf-8');
      });

      stream.on('end', () => {
        const sanitizeFilePath = (path) => {
          // Removes control characters from the path
          return path.replace(/[\x00-\x1F\x7F-\x9F]/g, '');
        };

        const files = output
          .trim()
          .split('\n')
          .filter(path => path.startsWith('/project') && path !== '/project')
          .map(fullPath => {
            const sanitizedPath = sanitizeFilePath(fullPath);
            const relativePath = sanitizedPath.replace('/project', '');
            const filename = relativePath.split('/').pop();

            // Adjust the logic here to properly determine if it's a folder or file
            const isFolder = !filename.includes('.') || fullPath.endsWith('/'); // Correctly identify folders

            return {
              path: relativePath,
              name: filename,
              type: isFolder ? 'folder' : 'file',
              children: [], // Folders may contain children, which will be populated later
            };
          });

        const fileTree = buildFileTree(files);

        res.status(200).json(createResponse(true, { files: fileTree }, null));
        //console.log('Files fetched successfully:', fileTree);
      });


      stream.on('error', (err) => {
        console.error('Stream error while listing files:', err);
        res.status(500).json(createResponse(false, {}, 'Error processing file list'));
      });
    });
  } catch (error) {
    console.error('Error fetching project files:', error);
    res.status(500).json(createResponse(false, {}, error));
  }
}

// Helper function to build a nested file tree structure
function buildFileTree(files) {
  const fileTree = [];

  files.forEach(file => {
    const pathParts = file.path.split('/').filter(Boolean); // Split the path by '/' and remove empty parts
    let currentLevel = fileTree;

    pathParts.forEach((part, index) => {
      let existingPath = currentLevel.find(item => item.name === part);

      if (!existingPath) {
        existingPath = {
          name: part,
          path: pathParts.slice(0, index + 1).join('/'),
          type: index === pathParts.length - 1 ? file.type : 'folder',
          children: [],
        };
        currentLevel.push(existingPath);
      }

      currentLevel = existingPath.children;
    });
  });

  return fileTree;
}

async function getFileContentHandler(req, res) {
  const { project_id } = req.params;
  const filePath = req.params[0]; // The file path relative to the project root

  try {
    //console.log(`Fetching file content for: ${filePath}`);

    // Fetch the project details to get the container ID
    const project = await getProjectDetailsById(project_id);
    if (!project) {
      //console.log('Project not found.');
      return res.status(404).json(createResponse(false, {}, 'Project not found'));
    }

    const container = docker.getContainer(project.container_id);

    // Fix the path by ensuring it starts with '/'
    const fullPath = `/project${filePath.startsWith('/') ? filePath : `/${filePath}`}`;
    //console.log(`Full file path in container: ${fullPath}`);

    // Execute the 'cat' command to get the file content
    const exec = await container.exec({
      Cmd: ['cat', fullPath],
      AttachStdout: true,
      AttachStderr: true,
    });

    exec.start((err, stream) => {
      if (err) {
        console.error('Error reading file content:', err);
        return res.status(500).json(createResponse(false, {}, 'Error reading file content in container'));
      }

      let content = '';
      stream.on('data', (data) => {
        content += data.toString('utf-8'); // Capture the file content with utf-8 encoding
      });

      stream.on('end', () => {
        // Sanitize the content by removing unwanted control characters (SOH, FS, etc.)
        const sanitizedContent = content.replace(/[\x00-\x1F\x7F]/g, ''); // Removes control characters
        //console.log(`Sanitized file content fetched for: ${filePath}`);

        res.status(200).json(createResponse(true, { content: sanitizedContent }, null));
      });

      stream.on('error', (err) => {
        console.error('Stream error while reading file:', err);
        res.status(500).json(createResponse(false, {}, 'Error during file reading'));
      });
    });
  } catch (error) {
    console.error('Error in getFileContentHandler:', error);
    res.status(500).json(createResponse(false, {}, error.message || 'Internal Server Error'));
  }
}


const tar = require('tar-stream'); // Ensure tar-stream is required

async function createFileHandler(req, res) {
  const { project_id } = req.params;
  const { parentPath, name, type, content } = req.body;

  try {
    const project = await getProjectDetailsById(project_id);
    if (!project) {
      return res.status(404).json(createResponse(false, {}, 'Project not found'));
    }

    const container = docker.getContainer(project.container_id);

    // Sanitize the parentPath to avoid double slashes or incorrect formatting
    const sanitizedParentPath = parentPath ? parentPath.replace(/\/+$/, '') : ''; // Trim trailing slashes
    const fullPath = sanitizedParentPath ? `${sanitizedParentPath}/${name}` : `/${name}`; // Always start the path with '/'
    console.log(`parentPath: ${parentPath}`);
    console.log(`Full path for new ${type}: ${fullPath}`);

    if (type === 'folder') {
      // Create a folder inside the container
      const exec = await container.exec({
        Cmd: ['mkdir', '-p', `/project${fullPath}`], // Ensure folder is created under /project
        AttachStdout: true,
        AttachStderr: true,
      });

      await new Promise((resolve, reject) => {
        exec.start((err, stream) => {
          if (err) {
            console.error('Error during folder creation:', err);
            return reject(err);
          }
          stream.on('data', (data) => console.log(`Folder creation output: ${data}`));
          stream.on('end', () => resolve());
          stream.on('error', (err) => reject(err));
        });
      });

      req.io.to(`project-${project_id}`).emit('file-created', { path: fullPath, name, type: 'folder' });
      return res.status(201).json(createResponse(true, { path: fullPath }, null));
    } else if (type === 'file') {
      // Ensure the parent directory exists before creating the file
      if (sanitizedParentPath) {
        const exec = await container.exec({
          Cmd: ['mkdir', '-p', `/project${sanitizedParentPath}`], // Ensure the correct parent folder is present
          AttachStdout: true,
          AttachStderr: true,
        });

        await new Promise((resolve, reject) => {
          exec.start((err, stream) => {
            if (err) {
              console.error('Error ensuring parent folder exists:', err);
              return reject(err);
            }
            stream.on('data', (data) => console.log(`Parent folder creation output: ${data}`));
            stream.on('end', () => resolve());
            stream.on('error', (err) => reject(err));
          });
        });
      }

      // Create a file in the specified parent directory
      const tarStream = tar.pack();
      tarStream.entry({ name }, content || '', (err) => {
        if (err) {
          console.error('Error adding entry to tar stream:', err);
          return res.status(500).json(createResponse(false, {}, 'Error creating file entry'));
        }
        tarStream.finalize();

        // Ensure the file is placed inside the correct parent folder
        const targetPath = sanitizedParentPath ? `/project/${sanitizedParentPath}` : '/project';
        console.log(`Target path for file: ${targetPath}`); // Additional logging to check the target path
        
        container.putArchive(tarStream, { path: targetPath }, (err) => {
          if (err) {
            console.error('Error during file creation:', err);
            return res.status(500).json(createResponse(false, {}, 'Error copying file to container'));
          }
          req.io.to(`project-${project_id}`).emit('file-created', { path: fullPath, name, type: 'file' });
          return res.status(201).json(createResponse(true, { path: fullPath }, null));
        });
      });
    } else {
      return res.status(400).json(createResponse(false, {}, 'Invalid type specified'));
    }
  } catch (error) {
    console.error('Error in createFileHandler:', error);
    res.status(500).json(createResponse(false, {}, error.message || 'Internal Server Error'));
  }
}



async function updateFileNameHandler(req, res) {
  const { project_id } = req.params;
  const filePath = req.params[0];
  const { newName } = req.body;

  try {
    //console.log(`Renaming file or folder at path: ${filePath} to ${newName}`);
    const project = await getProjectDetailsById(project_id);
    if (!project) {
      //console.log('Project not found.');
      return res.status(404).json(createResponse(false, {}, 'Project not found'));
    }

    const container = docker.getContainer(project.container_id);

    const oldPath = `/project${filePath}`;
    const newPath = oldPath.split('/').slice(0, -1).concat(newName).join('/');

    if (!newPath) {
      throw new Error('Failed to construct new path.');
    }

    const exec = await container.exec({
      Cmd: ['mv', oldPath, newPath],
      AttachStdout: true,
      AttachStderr: true,
    });

    await new Promise((resolve, reject) => {
      exec.start((err, stream) => {
        if (err) {
          console.error('Error during rename:', err);
          return reject(err);
        }

        stream.on('data', (data) => {
          //console.log(`Rename output: ${data}`);
        });

        stream.on('end', () => {
          //console.log(`Rename finished: ${oldPath} to ${newPath}`);
          resolve();
        });

        stream.on('error', (err) => {
          console.error('Stream error during rename:', err);
          reject(err);
        });
      });
    });

    const sanitizedNewPath = newPath.replace('/project', '');

    req.io.to(`project-${project_id}`).emit('file-renamed', {
      oldPath: filePath, // Pass the original filePath
      newPath: sanitizedNewPath, // The new path after renaming
      newName: newName, // The new name of the file/folder
    });

    res.status(200).json(createResponse(true, { oldPath, newPath: sanitizedNewPath }, null));
    //console.log(`File or folder renamed successfully: ${oldPath} to ${newPath}`);
  } catch (error) {
    console.error('Error in updateFileNameHandler:', error);
    res.status(500).json(createResponse(false, {}, error.message || 'Internal Server Error'));
  }
}

async function deleteFileHandler(req, res) {
  const { project_id } = req.params;
  const filePath = req.params[0];

  try {
    //console.log(`Attempting to delete file or folder at path: ${filePath}`);

    const project = await getProjectDetailsById(project_id);
    if (!project) {
      //console.log('Project not found.');
      return res.status(404).json(createResponse(false, {}, 'Project not found'));
    }

    const container = docker.getContainer(project.container_id);

    // Ensure filePath starts with '/'
    const fullPath = `/project${filePath.startsWith('/') ? filePath : `/${filePath}`}`;
    //console.log(`Full path in container: ${fullPath}`);

    const exec = await container.exec({
      Cmd: ['rm', '-rf', fullPath], // Forcefully remove the file/folder
      AttachStdout: true,
      AttachStderr: true,
    });

    exec.start((err, stream) => {
      if (err) {
        console.error('Error deleting file or folder:', err);
        return res.status(500).json(createResponse(false, {}, 'Error deleting file or folder in container'));
      }

      stream.on('data', (data) => {
        //console.log(`Delete output: ${data}`);
      });

      stream.on('end', () => {
        //console.log(`File or folder deleted successfully: ${filePath}`);
        req.io.to(`project-${project_id}`).emit('file-deleted', { path: filePath });
        res.status(200).json(createResponse(true, { deleted: filePath }, null));
      });

      stream.on('error', (err) => {
        console.error('Stream error during deletion:', err);
        res.status(500).json(createResponse(false, {}, 'Error during file deletion'));
      });
    });
  } catch (error) {
    console.error('Error in deleteFileHandler:', error);
    res.status(500).json(createResponse(false, {}, error.message || 'Internal Server Error'));
  }
}

async function updateFileContentHandler(req, res) {
  const { project_id } = req.params;
  const filePath = req.params[0];
  const { content } = req.body;

  try {
    //console.log(`Updating content for file at path: ${filePath}`);
    const project = await getProjectDetailsById(project_id);
    if (!project) {
      //console.log('Project not found.');
      return res.status(404).json(createResponse(false, {}, 'Project not found'));
    }

    const container = docker.getContainer(project.container_id);

    // Ensure the file path starts with '/'
    const fullPath = `/project${filePath.startsWith('/') ? filePath : `/${filePath}`}`;
    //console.log(`Full file path in container: ${fullPath}`);

    // Sanitize content to escape any single quotes
    const sanitizedContent = content.replace(/'/g, `'\\''`);

    const exec = await container.exec({
      Cmd: ['sh', '-c', `echo '${sanitizedContent}' > ${fullPath}`],
      AttachStdout: true,
      AttachStderr: true,
    });

    exec.start((err, stream) => {
      if (err) {
        console.error('Error updating file content:', err);
        return res.status(500).json(createResponse(false, {}, 'Error updating file content'));
      }

      stream.on('data', (data) => {
        //console.log(`Content update output: ${data}`);
      });

      stream.on('end', () => {
        req.io.to(`project-${project_id}`).emit('file-updated', {
          path: filePath,
          content,
        });

        res.status(200).json(createResponse(true, {}, null));
        //console.log(`File content updated successfully: ${filePath}`);
      });

      stream.on('error', (err) => {
        console.error('Stream error during content update:', err);
        res.status(500).json(createResponse(false, {}, 'Error processing file content update'));
      });
    });
  } catch (error) {
    console.error('Error in updateFileContentHandler:', error);
    res.status(500).json(createResponse(false, {}, error.message || 'Internal Server Error'));
  }
}

async function shareProjectHandler(req, res) {
  const { project_id } = req.params;
  const { identifier } = req.body;

  if (!project_id || !identifier) {
    return res.status(400).json(createResponse(false, {}, 'project_id and identifier are required'));
  }

  try {
    let targetUserId = null;

    // Determine if the identifier is numeric (userId) or a username
    if (!isNaN(identifier)) {
      targetUserId = identifier; // It's a numeric userId
    } else {
      const user = await getUserByUsername(identifier);
      if (!user) {
        return res.status(404).json(createResponse(false, {}, 'User not found'));
      }
      targetUserId = user.id;
    }

    //console.log(`Sharing project ID: ${project_id} with user ID: ${targetUserId}`);
    await shareProject(project_id, targetUserId);

    res.status(201).json(createResponse(true, {}, null));
  } catch (error) {
    console.error('Error sharing project:', error.message);

    if (error.message === 'User is already a collaborator on this project') {
      return res.status(409).json(createResponse(false, { message: error.message }, error.message));
    }

    res.status(500).json(createResponse(false, {}, 'Internal server error'));
  }
}

async function notifyFileChangeHandler(req, res) {
  //console.log('Notify File Change Handler Hit')
  const { project_id } = req.params;
  const io = req.app.get('io');

  try {
    // Emit an event to all clients in the project room to refresh the file sytem
    io.to(`project-${project_id}`).emit('refresh-files');

    res.status(200).json({ success: true, message: 'Clients notified to refresh file system.' });
  } catch (error) {
    console.error('Error in notifyFileChange:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
}

module.exports = {
  createProjectHandler,
  getProjectsHandler,
  getProjectHandler,
  updateProjectHandler,
  deleteProjectHandler,
  getProjectFilesHandler,
  createFileHandler,
  getFileContentHandler,
  updateFileNameHandler,
  deleteFileHandler,
  updateFileContentHandler,
  shareProjectHandler,
  notifyFileChangeHandler
};
