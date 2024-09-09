import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axiosInstance from '@/utils/axios';
import FileExplorer, { FileSystemItem, File, Folder } from './components/fileExplorer';
import FileEditor from './components/fileEditor';
import { API_LIST } from '@/constants/api';
import ShareProjectModal from '@/components/modal/shareProjectModal';
import { Button } from '@/components/ui/button';
import TerminalComponent from './components/terminal';
import { Resizable } from 'react-resizable';
import { useWebSocket } from '@/contexts/websocketContext';
import 'react-resizable/css/styles.css';
import { v4 as uuidv4 } from 'uuid';

const ProjectView: React.FC = () => {
  const { project_id } = useParams<{ project_id: string }>();
  const [fileSystem, setFileSystem] = useState<FileSystemItem[]>([]);
  const [selectedFile, setSelectedFile] = useState<FileSystemItem | null>(null);
  const [renamingItem, setRenamingItem] = useState<FileSystemItem | null>(null);
  const [showShareModal, setShowShareModal] = useState<boolean>(false);
  const [isTerminalVisible, setIsTerminalVisible] = useState<boolean>(false);
  const [containerId, setContainerId] = useState<string | null>(null);
  const [terminalHeight, setTerminalHeight] = useState<number>(200);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

  const socket = useWebSocket();
  const pendingCreation = useRef<Set<string>>(new Set());  // Track pending creations

  const updateChildrenPaths = useCallback(
    (children: FileSystemItem[], oldPath: string, newPath: string): FileSystemItem[] => {
      return children.map((child) => {
        const updatedChildPath = child.path.replace(oldPath, newPath);
        if (child.type === 'folder') {
          return {
            ...child,
            path: updatedChildPath,
            children: updateChildrenPaths((child as Folder).children, oldPath, newPath),
          };
        } else {
          return { ...child, path: updatedChildPath };
        }
      });
    },
    []
  );

  const updateFileSystemAfterRename = useCallback(
    (
      fileSystem: FileSystemItem[],
      oldPath: string,
      newPath: string,
      newName: string,
      itemType: 'file' | 'folder'
    ): FileSystemItem[] => {
      return fileSystem.map((item) => {
        if (item.path === oldPath) {
          const updatedItem = { ...item, name: newName, path: newPath };

          if (itemType === 'folder' && item.type === 'folder') {
            return {
              ...updatedItem,
              children: updateChildrenPaths((item as Folder).children, oldPath, newPath),
            } as Folder;
          }
          return updatedItem;
        }

        if (item.type === 'folder') {
          return {
            ...item,
            children: updateFileSystemAfterRename(
              (item as Folder).children,
              oldPath,
              newPath,
              newName,
              itemType
            ),
          };
        }

        return item;
      });
    },
    [updateChildrenPaths]
  );

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        //console.log('Fetching project files...');
        const filesResponse = await axiosInstance.get(API_LIST.GET_PROJECT_FILES(Number(project_id)));
        if (filesResponse.data.success) {
          const files = filesResponse.data.data.files;
          //console.log('Project files fetched successfully:', files);
          

          const updatedFileSystem = files.map((file: { path: string; name: string; children?: FileSystemItem[] }) => ({
            uuid: uuidv4(),
            ...file,
            type: file.path.endsWith('/') || !file.name.includes('.') ? 'folder' : 'file',
            children: file.children || [], // Use existing children or an empty array
          }));
          
          setFileSystem(updatedFileSystem);
        }

        //console.log('Fetching project details...');
        const projectResponse = await axiosInstance.get(API_LIST.GET_PROJECT_DETAILS(Number(project_id)));
        if (projectResponse.data.success) {
          setContainerId(projectResponse.data.data.project.container_id);
          //console.log('Project details fetched successfully:', projectResponse.data.data.project);
        }
      } catch (error) {
        console.error('Error fetching project data:', error);
      }
    };

    fetchProjectData();

    if (project_id) {
      socket.emit('join-project', { project_id });

      socket.on('refresh-files', () => {
        //console.log('Received refresh-files event, fetching updated file system...');
        fetchProjectData();  // Re-fetch the file system
      });

      socket.on('file-created', ({ path, name, type }) => {
        if (pendingCreation.current.has(path)) {
          pendingCreation.current.delete(path);
          return; // Prevent duplicate addition
        }

        const newFile: FileSystemItem = {
          uuid: uuidv4(),
          path,
          name,
          type,
          children: [],
          project_id: Number(project_id),
        };

        setFileSystem((prev) => {
          const fileExists = prev.some((file) => file.path === path);
          return fileExists ? prev : [...prev, newFile];
        });
      });

      socket.on('file-deleted', ({ path }) => {
        setFileSystem((prev) => removeFileSystemItem(prev, path));
      });

      socket.on('file-renamed', ({ oldPath, newPath, newName }) => {
        setFileSystem((prev) =>
          prev.map((item) => {
            if (item.path === oldPath) {
              const updatedItem = {
                ...item,
                path: newPath,
                name: newName,
              };

              if (item.type === 'folder') {
                return {
                  ...updatedItem,
                  children: updateChildrenPaths((item as Folder).children, oldPath, newPath),
                } as Folder;
              }

              return updatedItem;
            }

            if (item.type === 'folder') {
              return {
                ...item,
                children: updateFileSystemAfterRename(
                  (item as Folder).children,
                  oldPath,
                  newPath,
                  newName,
                  'folder'
                ),
              } as Folder;
            }

            return item;
          })
        );
      });

      return () => {
        socket.off('refresh-files');
        socket.off('file-created');
        socket.off('file-edited');
        socket.off('file-deleted');
        socket.off('file-renamed');
      };
    }
  }, [
    project_id,
    socket,
    updateChildrenPaths,
    updateFileSystemAfterRename,
  ]);

  const handleFileSelect = async (file: FileSystemItem) => {
    if (renamingItem?.uuid === file.uuid) {
      //console.log('Skipping content fetch for file that is being renamed.');
      return;
    }

    if (file.type === 'file') {
      try {
        //console.log('Fetching file content for file:', file.path);
        const response = await axiosInstance.get(API_LIST.GET_FILE_CONTENT(Number(project_id), file.path));
        if (response.data.success) {
          const fileWithContent = {
            ...file,
            content: response.data.data.content,
            project_id: Number(project_id),
          };
          setSelectedFile(fileWithContent);
          //console.log('File content fetched and selected:', fileWithContent);
        }
      } catch (error) {
        console.error('Error fetching file content:', error);
      }
    } else {
      setSelectedFile(file);
    }
  };

  const updateFileContent = async (project_id: number, filePath: string, content: string, language: string) => {
    try {
      //console.log('Updating file content:', filePath);
      const response = await axiosInstance.put(API_LIST.UPDATE_FILE_CONTENT(project_id, filePath), {
        content,
        language,
      });

      if (response.data.success) {
        //console.log('File content updated successfully:', response.data.data.file);
        return response.data.data.file;
      } else {
        console.error('Failed to update file content:', response.data);
        return null;
      }
    } catch (error) {
      console.error('Error updating file content:', error);
      return null;
    }
  };

  const handleFileSave = async (file: File) => {
    const updatedFile = await updateFileContent(
      Number(project_id),
      file.path,
      file.content,
      file.language
    );

    if (updatedFile) {
      setFileSystem((prev) => updateFileSystem(prev, updatedFile));
    }
  };

  const handleAddFile = (parentPath: string | null) => {
    const tempFile: File = {
      uuid: uuidv4(),
      path: parentPath ? `${parentPath}/New File` : `/New File`,
      name: 'New File',
      type: 'file',
      content: '',
      language: 'plaintext',
      project_id: Number(project_id),
    };

    pendingCreation.current.add(tempFile.path); // Mark the creation as pending

    setFileSystem((prev) => {
      const updatedFileSystem = parentPath
        ? prev.map((item) => {
          if (item.path === parentPath && item.type === 'folder') {
            setExpandedFolders((prev) => new Set(prev).add(parentPath));
            // Check if file already exists
            const fileExists = (item as Folder).children.some(
              (child) => child.path === tempFile.path
            );
            return fileExists
              ? item
              : { ...item, children: [...(item as Folder).children, tempFile] };
          }
          return item;
        })
        : prev.some((file) => file.path === tempFile.path)
          ? prev
          : [...prev, tempFile];

      return updatedFileSystem;
    });

    setRenamingItem(tempFile);
  };


  const handleAddFolder = (parentPath: string | null) => {
    //console.log('Adding new folder at path:', parentPath);

    const tempFolder: Folder = {
      uuid: uuidv4(),
      path: parentPath ? `${parentPath}/New Folder` : `/New Folder`,
      name: 'New Folder',
      type: 'folder',
      children: [],
      project_id: Number(project_id),
    };

    pendingCreation.current.add(tempFolder.path); // Mark the creation as pending

    setFileSystem((prev) => {
      const updatedFileSystem = parentPath
        ? prev.map((item) => {
          if (item.path === parentPath && item.type === 'folder') {
            setExpandedFolders((prev) => new Set(prev).add(parentPath));
            return { ...item, children: [...(item as Folder).children, tempFolder] };
          }
          return item;
        })
        : [...prev, tempFolder];

      return updatedFileSystem;
    });

    setRenamingItem(tempFolder);
  };

  const handleRenameItem = async (filePath: string, newName: string, itemType: 'file' | 'folder') => {
    try {
      //console.log(`Starting rename process for ${itemType} - Old Path: ${filePath}, New Name: ${newName}`);

      const isNewItem = filePath.includes('New File') || filePath.includes('New Folder');
      let response: any;

      // Declare and initialize parentPath before using it
      const parentPath = filePath.split('/').slice(0, -1).join('/') || '/';

      if (isNewItem) {
        //console.log(`Creating new ${itemType}: ${newName}`);

        const type = itemType === 'file' ? 'file' : 'folder';

        // Use parentPath here since it's now defined
        response = await axiosInstance.post(API_LIST.CREATE_FILE(Number(project_id)), {
          parentPath: parentPath || null,
          name: newName,
          type: type,
          content: itemType === 'file' ? '' : undefined,
        });

        if (response.data.success) {
          //console.log(`Created ${itemType} successfully: ${newName}`);
          const createdItem = response.data.data;

          setFileSystem((prev) =>
            updateFileSystemAfterRename(prev, filePath, createdItem.path, newName, itemType)
          );
          pendingCreation.current.delete(filePath);  // Remove from pending creations
          setRenamingItem(null);
        } else {
          console.error(`Failed to create ${itemType}: ${response.data.error}`);
        }
      } else {
        //console.log(`Renaming existing ${itemType} - Old Path: ${filePath}, New Name: ${newName}`);

        // Use parentPath again here for the existing item rename
        response = await axiosInstance.put(API_LIST.UPDATE_FILE_NAME(Number(project_id), filePath), {
          newName,
        });

        if (response.data.success) {
          const updatedItem = response.data.data;
          setFileSystem((prev) =>
            updateFileSystemAfterRename(prev, filePath, updatedItem.newPath, newName, itemType)
          );
          setRenamingItem(null);
        } else {
          console.error(`Failed to rename ${itemType}: ${response.data.error}`);
        }
      }
    } catch (error) {
      console.error('Error renaming item:', error);
    }
  };

  const handleDeleteItem = async (filePath: string) => {
    try {
      //console.log('Deleting item:', filePath);
      const response = await axiosInstance.delete(API_LIST.DELETE_FILE(Number(project_id), filePath));
      if (response.data.success) {
        setFileSystem((prev) => removeFileSystemItem(prev, filePath));
      }
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const toggleTerminal = () => {
    setIsTerminalVisible((prev) => !prev);
  };

  const handleResize = (event: any, { size }: any) => {
    setTerminalHeight(size.height);
  };

  const handleShareProject = () => {
    //console.log('Project shared successfully!');
  };

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <div style={{ width: '250px', borderRight: '1px solid #ccc', height: '100%' }}>
        <FileExplorer
          fileSystem={fileSystem}
          onFileSelect={handleFileSelect}
          onAddFile={handleAddFile}
          onAddFolder={handleAddFolder}
          onRenameItem={handleRenameItem}
          onDeleteItem={handleDeleteItem}
          renamingItem={renamingItem}
          setRenamingItem={setRenamingItem}
          expandedFolders={expandedFolders}
          setExpandedFolders={setExpandedFolders}
        />
      </div>
      <div style={{ flexGrow: 1, padding: '1rem', display: 'flex', flexDirection: 'column' }}>
        <FileEditor selectedFile={selectedFile as File | null} onSave={handleFileSave} />

        <Button
          onClick={toggleTerminal}
          variant="leaf"
          size="leaf"
          state="inactive"
          weight="bold"
          font="body-base"
          className="uppercase text-white bg-terminal mt-4"
        >
          {isTerminalVisible ? 'Hide Terminal' : 'Show Terminal'}
        </Button>

        {isTerminalVisible && (
          <Resizable
            height={terminalHeight}
            width={0}
            onResize={handleResize}
            axis="y"
            minConstraints={[100, 100]}
            maxConstraints={[500, 500]}
            resizeHandles={['n']}
            handle={
              <span
                className="resize-handle"
                style={{
                  background: '#333',
                  width: '100%',
                  height: '10px',
                  cursor: 'row-resize',
                  display: 'block',
                }}
              />
            }
          >
            <div
              style={{
                height: `${terminalHeight}px`,
                backgroundColor: '#000',
                padding: '0.5rem',
                borderRadius: '4px',
                color: '#fff',
                marginTop: '1rem',
              }}
            >
              {containerId && <TerminalComponent containerId={containerId} />}
            </div>
          </Resizable>
        )}

        <ShareProjectModal
          project_id={Number(project_id)}
          open={showShareModal}
          onOpenChange={setShowShareModal}
          onShare={handleShareProject}
        >
          <Button
            variant="leaf"
            size="leaf"
            state="inactive"
            weight="bold"
            font="body-base"
            className="uppercase text-white bg-terminal"
          >
            Open Share Modal
          </Button>
        </ShareProjectModal>
      </div>
    </div>
  );
};

const updateFileSystem = (fileSystem: FileSystemItem[], updatedFile: File): FileSystemItem[] => {
  if (!updatedFile || !updatedFile.path) {
    console.error('Invalid updated file received:', updatedFile);
    return fileSystem;
  }

  return fileSystem.map((item) => {
    if (item.type === 'file' && item.path === updatedFile.path) {
      return {
        ...item,
        content: updatedFile.content,
        name: updatedFile.name,
        language: updatedFile.language,
      };
    }
    if (item.type === 'folder') {
      return {
        ...item,
        children: updateFileSystem((item as Folder).children, updatedFile),
      };
    }
    return item;
  });
};

const removeFileSystemItem = (fileSystem: FileSystemItem[], filePath: string): FileSystemItem[] => {
  return fileSystem.filter((item) => item.path !== filePath);
};

export default ProjectView;
