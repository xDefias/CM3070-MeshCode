import React, { useState, useEffect, useRef } from 'react';
import ContextMenu from './contextMenu';

export interface File {
  uuid: string;
  path: string;
  name: string;
  type: 'file';
  content: string;
  language: string;
  project_id: number;
}

export interface Folder {
  uuid: string;
  path: string;
  name: string;
  type: 'folder';
  children: Array<File | Folder>;
  project_id: number;
}

export type FileSystemItem = File | Folder;

interface FileExplorerProps {
  fileSystem: FileSystemItem[];
  onFileSelect: (file: FileSystemItem) => void;
  onAddFile: (parentPath: string | null) => void;
  onAddFolder: (parentPath: string | null) => void;
  onRenameItem: (itemPath: string, newName: string, itemType: 'file' | 'folder') => void;
  onDeleteItem: (itemPath: string) => void;
  renamingItem: FileSystemItem | null;
  setRenamingItem: React.Dispatch<React.SetStateAction<FileSystemItem | null>>;
  expandedFolders: Set<string>;
  setExpandedFolders: React.Dispatch<React.SetStateAction<Set<string>>>;
}

const FileExplorer: React.FC<FileExplorerProps> = ({
  fileSystem,
  onFileSelect,
  onAddFile,
  onAddFolder,
  onRenameItem,
  onDeleteItem,
  renamingItem,
  setRenamingItem,
  expandedFolders,
  setExpandedFolders,
}) => {
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; item: FileSystemItem | null } | null>(null);
  const [selectedItem, setSelectedItem] = useState<FileSystemItem | null>(null);
  const contextMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(event.target as Node)) {
        setContextMenu(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleToggleFolder = (folderUuid: string) => {
    setExpandedFolders((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(folderUuid)) {
        newSet.delete(folderUuid); // Collapse the folder if already expanded
      } else {
        newSet.add(folderUuid); // Expand the folder if not already expanded
      }
      //console.log(`Toggled folder: ${folderUuid}, Is Expanded: ${newSet.has(folderUuid)}`);
      return newSet;
    });
  };

  const handleContextMenu = (event: React.MouseEvent, item: FileSystemItem | null = null) => {
    event.preventDefault();
    event.stopPropagation();
    if (item) {
      setSelectedItem(item);
      setContextMenu({ x: event.clientX, y: event.clientY, item });
    } else {
      setContextMenu({ x: event.clientX, y: event.clientY, item: null });
    }
  };

  const handleItemClick = (item: FileSystemItem) => {
    setSelectedItem(item);
    onFileSelect(item);
  };

  const handleAddFile = () => {
    onAddFile(contextMenu?.item?.path || null);
    setContextMenu(null);
  };

  const handleAddFolder = () => {
    onAddFolder(contextMenu?.item?.path || null);
    setContextMenu(null);
  };

  const handleDelete = () => {
    if (contextMenu?.item) {
      onDeleteItem(contextMenu.item.path);
      setContextMenu(null);
    }
  };

  const handleRenameSubmit = (event: React.FormEvent, item: FileSystemItem) => {
    event.preventDefault();
    const target = event.target as HTMLFormElement;
    const input = target.elements.namedItem('name') as HTMLInputElement;

    if (input.value.trim() === '') {
      console.warn('Rename input is empty');
      return;
    }

    const newName = input.value.trim();
    //console.log(`Submitting rename - Old Name: ${item.name}, New Name: ${newName}`);

    // Trigger renaming logic
    onRenameItem(item.path, newName, item.type);

    // Close renaming UI
    setRenamingItem(null);
  };

  const renderFileSystem = (items: FileSystemItem[], level: number = 0) => {
    return items.map((item) => {
      const key = `${item.type}-${item.uuid}`;
      const isSelected = selectedItem && selectedItem.uuid === item.uuid;
      const itemStyle = isSelected ? 'bg-grey' : '';
      const indentStyle = { paddingLeft: `${level * 20}px` }; // Indent for nested items

      //console.log(`Rendering item: ${item.name}, Expanded: ${expandedFolders.has(item.uuid)}`);

      if (item.type === 'folder') {
        const isExpanded = expandedFolders.has(item.uuid);
        //console.log(`Folder: ${item.name} has ${item.children.length} children.`); // Log the number of children

        return (
          <div key={key} style={indentStyle}>
            <div
              onContextMenu={(e) => handleContextMenu(e, item)}
              onClick={() => handleItemClick(item)}
              className={`p-2 cursor-pointer ${itemStyle}`}
            >
              {renamingItem && renamingItem.uuid === item.uuid ? (
                <form onSubmit={(e) => handleRenameSubmit(e, item)} className="inline">
                  <input name="name" defaultValue={item.name} className="p-2 border border-grey" autoFocus />
                  <button type="submit" className="ml-2 p-2 bg-terminal text-black">
                    Rename
                  </button>
                </form>
              ) : (
                <div onClick={() => handleToggleFolder(item.uuid)}>
                  {isExpanded ? '📂' : '📁'} {item.name} {/* Folder icon changes based on expansion */}
                </div>
              )}
            </div>
            {isExpanded && item.children && item.children.length > 0 && (
              <div className="pl-4">
                {renderFileSystem(item.children, level + 1)} {/* Recursively render children */}
              </div>
            )}
          </div>
        );
      }

      return (
        <div
          key={key}
          onContextMenu={(e) => handleContextMenu(e, item)}
          onClick={() => handleItemClick(item)}
          className={`p-2 cursor-pointer ${itemStyle}`}
          style={indentStyle} // Indent for files
        >
          {renamingItem && renamingItem.uuid === item.uuid ? (
            <form onSubmit={(e) => handleRenameSubmit(e, item)} className="inline">
              <input name="name" defaultValue={item.name} className="p-2 border border-grey" autoFocus />
              <button type="submit" className="ml-2 p-2 bg-terminal text-black">
                Rename
              </button>
            </form>
          ) : (
            <>📄 {item.name}</>
          )}
        </div>
      );
    });
  };



  return (
    <div className="h-full border border-grey" onContextMenu={(e) => handleContextMenu(e, null)}>
      {fileSystem.length > 0 ? renderFileSystem(fileSystem) : <div className="p-4 text-grey">Right-click to add files or folders</div>}
      {contextMenu && (
        <div ref={contextMenuRef}>
          <ContextMenu
            x={contextMenu.x}
            y={contextMenu.y}
            onAddFile={handleAddFile}
            onAddFolder={handleAddFolder}
            onDelete={handleDelete}
            onRename={() => setRenamingItem(contextMenu.item)}
            selectedItem={contextMenu.item}
          />
        </div>
      )}
    </div>
  );
};

export default FileExplorer;
