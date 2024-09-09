import React from 'react';
import { FileSystemItem } from './fileExplorer';

interface ContextMenuProps {
  x: number | string;
  y: number | string;
  onAddFile: () => void;
  onAddFolder: () => void;
  onDelete: () => void;
  onRename: () => void;
  selectedItem: FileSystemItem | null;
}

const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, onAddFile, onAddFolder, onDelete, onRename, selectedItem }) => {
  return (
    <div style={{ position: 'absolute', top: `${y}px`, left: `${x}px`, background: 'white', border: '1px solid #ccc', zIndex: 1000 }}>
      <div onClick={onAddFile}>Add File</div>
      <div onClick={onAddFolder}>Add Folder</div>
      <div onClick={onRename}>Rename</div>
      <div onClick={onDelete}>Delete</div>
    </div>
  );
};

export default ContextMenu;
