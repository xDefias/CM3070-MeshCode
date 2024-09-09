const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const session = require('express-session');
const RedisStore = require('connect-redis').default;
const redis = require('redis');
const http = require('http');
const socketIo = require('socket.io');
const Docker = require('dockerode');
const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');
const projectRoutes = require('./routes/projectRoutes');
const authMiddleware = require('./middlewares/authMiddleware');
const { getProjectDetailsById } = require('./models/projectModel');
require('dotenv').config();

const docker = new Docker();  // Initialize Docker
const redisClient = redis.createClient();

redisClient.on('error', (err) => {
  console.error('Redis client error', err);
});

redisClient.on('ready', () => {
  //console.log('Redis client connected');
});

redisClient.on('end', () => {
  //console.log('Redis client disconnected');
});

const app = express();

const corsOptions = {
  origin: 'http://localhost:3002',
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

const sessionParser = session({
  store: new RedisStore({ client: redisClient }),
  secret: process.env.SESSION,
  resave: false,
  saveUninitialized: true,
});

app.use(sessionParser);
// Increase the limit to 50mb or adjust according to your needs
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/profile', authMiddleware, profileRoutes);
app.use('/api/projects', (req, res, next) => {
  req.io = io;  // Attach the io object to the request
  next();
}, projectRoutes);

const PORT = process.env.PORT || 3000;
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: 'http://localhost:3002',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

app.set('io', io);

io.use((socket, next) => {
  sessionParser(socket.request, {}, () => {
    const userId = socket.handshake.auth.userId;
    if (userId) {
      socket.userId = userId;
      next();
    } else {
      next(new Error('Unauthorized'));
    }
  });
});

const fileTimers = {};

// Handle socket connections
io.on('connection', (socket) => {
  const userId = socket.userId;
  //console.log(`User connected: ${userId}`);

  // Handle joining project rooms
  socket.on('join-project', async ({ project_id }) => {
    try {
      const projectRoom = `project-${project_id}`;
      socket.join(projectRoom);
      //console.log(`User joined project room: ${projectRoom}`);

      const project = await getProjectDetailsById(project_id);
      if (!project) {
        //console.log('Project not found.');
        socket.emit('error', { message: 'Project not found' });
        return;
      }
    } catch (error) {
      console.error('Error in join-project:', error);
      socket.emit('error', { message: 'Failed to join project' });
    }
  });

  // Handle joining file-specific rooms
  socket.on('join-file', async ({ project_id, filePath }) => {
    const fileRoom = `project-${project_id}-${filePath}`;
    socket.join(fileRoom);
    //console.log(`User joined file room: ${fileRoom}`);

    try {
      const project = await getProjectDetailsById(project_id);
      if (!project) {
        //console.log('Project not found.');
        socket.emit('error', { message: 'Project not found' });
        return;
      }

      const container = docker.getContainer(project.container_id);

      // Fetch file content from Redis or Docker container
      const cachedContent = await redisClient.get(fileRoom); // No need for promisify
      if (cachedContent) {
        //console.log(`Serving cached content for ${filePath}`);
        socket.emit('file-content', { path: filePath, content: cachedContent });
      } else {
        const fullPath = `/project${filePath.startsWith('/') ? filePath : `/${filePath}`}`;

        const exec = await container.exec({
          Cmd: ['cat', fullPath],
          AttachStdout: true,
          AttachStderr: true,
        });

        exec.start((err, stream) => {
          if (err) {
            console.error('Error fetching file content:', err);
            socket.emit('error', { message: 'Error fetching file content' });
            return;
          }

          let content = '';
          stream.on('data', (data) => {
            content += data.toString();
          });

          stream.on('end', async () => {
            await redisClient.set(fileRoom, content); // Cache the content in Redis
            socket.emit('file-content', { path: filePath, content });
            //console.log(`File content served from Docker: ${filePath}`);
          });

          stream.on('error', (err) => {
            console.error('Error reading file content stream:', err);
          });
        });
      }
    } catch (error) {
      console.error('Error in join-file handler:', error);
      socket.emit('error', { message: 'Failed to load file content' });
    }
  });

  // Handle file content editing
  socket.on('edit-file', async ({ project_id, filePath, content }) => {
    const fileRoom = `project-${project_id}-${filePath}`;

    try {
      const project = await getProjectDetailsById(project_id);
      if (!project) {
        //console.log('Project not found.');
        socket.emit('error', { message: 'Project not found' });
        return;
      }

      const container = docker.getContainer(project.container_id);

      // Cache the file content in Redis
      await redisClient.set(fileRoom, content);

      // Broadcast the updated content to everyone in the room (except the sender)
      socket.to(fileRoom).emit('file-edited', { filePath, content });

      // Set a timer to update the file content in the Docker container after 1 minute of inactivity
      const fileUpdateTimer = setTimeout(async () => {
        //console.log(`No activity on file ${filePath} for 1 minute. Updating Docker container...`);

        const fullPath = `/project${filePath.startsWith('/') ? filePath : `/${filePath}`}`;

        const sanitizedContent = content.replace(/'/g, `'\\''`);
        const exec = await container.exec({
          Cmd: ['sh', '-c', `echo '${sanitizedContent}' > ${fullPath}`],
          AttachStdout: true,
          AttachStderr: true,
        });

        exec.start((err, stream) => {
          if (err) {
            console.error('Error updating file content in Docker:', err);
            return;
          }

          stream.on('data', (data) => {
            //console.log(`File content update output: ${data}`);
          });

          stream.on('end', () => {
            //console.log(`File content for ${filePath} successfully updated in container`);
          });

          stream.on('error', (err) => {
            console.error('Stream error during file update:', err);
          });
        });
      }, 60000); // 1 minute timer

      // Clear the previous timer if it exists
      if (fileTimers[filePath]) {
        clearTimeout(fileTimers[filePath]);
      }

      // Store the new timer
      fileTimers[filePath] = fileUpdateTimer;
    } catch (error) {
      console.error('Error in edit-file handler:', error);
      socket.emit('error', { message: 'Failed to edit file' });
    }
  });



  // Handle file metadata changes (name, path changes)
  socket.on('file-metadata-changed', ({ project_id, oldPath, newPath, newName }) => {
    const projectRoom = `project-${project_id}`;

    // Broadcast file name/path change to everyone in the project room
    socket.to(projectRoom).emit('file-metadata-changed', { oldPath, newPath, newName });
  });

  // Terminal-related events
  socket.on('start-terminal', async ({ containerId }) => {
    //console.log(`Starting terminal for containerId: ${containerId}`);

    const container = docker.getContainer(containerId);

    try {
      const exec = await container.exec({
        AttachStdin: true,
        AttachStdout: true,
        AttachStderr: true,
        Tty: true,
        Cmd: ['/bin/bash'], // Replace with the shell you want to use
      });

      exec.start({ hijack: true, stdin: true }, (err, stream) => {
        if (err) {
          console.error(`Error starting exec: ${err.message}`);
          socket.emit('terminal-error', `Unable to start terminal in container ${containerId}`);
          return;
        }

        socket.on('terminal-input', (data) => {
          //console.log(`Received input for container ${containerId}: ${data}`);
          stream.write(data); // Send input to the container
        });

        stream.on('data', (chunk) => {
          socket.emit('terminal-output', chunk.toString()); // Send output back to the client
        });

        stream.on('end', () => {
          //console.log(`Stream ended for container ${containerId}`);
          socket.emit('terminal-output', '\r\nSession ended\r\n');
        });

        socket.on('disconnect', () => {
          //console.log(`Socket disconnected for container ${containerId}`);
          stream.end(); // End the stream when the client disconnects
        });
      });
    } catch (error) {
      console.error(`Error executing command in container: ${error.message}`);
      socket.emit('terminal-error', `Unable to start terminal in container ${containerId}`);
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    //console.log(`Socket disconnected for user: ${userId}`);

    Object.keys(fileTimers).forEach((filePath) => {
      clearTimeout(fileTimers[filePath]);
      delete fileTimers[filePath];
    });
  });
});

server.listen(PORT, () => {
  //console.log(`Server is running on port ${PORT}`);
});

redisClient.connect().then(() => {
  //console.log('Connected to Redis');
}).catch((err) => {
  console.error('Could not connect to Redis', err);
});
