import React, { useState, useEffect } from 'react';
import { Editor } from '@monaco-editor/react';
import { File } from './fileExplorer';
import { useWebSocket } from '@/contexts/websocketContext';
import { Button } from '@/components/ui/button';

interface FileEditorProps {
  selectedFile: File | null;
  onSave: (file: File) => void;
}

const FileEditor: React.FC<FileEditorProps> = ({ selectedFile, onSave }) => {
  const [content, setContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const socket = useWebSocket();

  useEffect(() => {
    if (selectedFile && selectedFile.type === 'file') {
      setIsLoading(true);
      setContent(selectedFile.content || ''); 
      if (selectedFile.project_id && selectedFile.path) {  // Ensure project_id and filePath exist
        //console.log(`Joining file room with project_id: ${selectedFile.project_id}, filePath: ${selectedFile.path}`);
        socket.emit('join-file', { project_id: selectedFile.project_id, filePath: selectedFile.path });

        socket.on('file-updated', ({ filePath, content }: { filePath: string; content: string }) => {
          if (filePath === selectedFile.path) {
            setContent(content);
          }
        });

        socket.on('file-edited', ({ filePath, content }: { filePath: string; content: string }) => {
          if (filePath === selectedFile.path) {
            setContent(content);
          }
        });

        setIsLoading(false);

        return () => {
          socket.off('file-updated');
          socket.off('file-edited');
        };
      } else {
        console.error('selectedFile does not have project_id or path');
      }
    }
  }, [selectedFile, socket]);

  const handleEditorChange = (value: string | undefined) => {
    setContent(value || '');

    if (selectedFile && selectedFile.project_id && selectedFile.path) {
      socket.emit('edit-file', {
        project_id: selectedFile.project_id,
        filePath: selectedFile.path,
        name: selectedFile.name,
        content: value || '',
        language: getLanguageFromExtension(selectedFile.name),
      });
    }
  };

  const handleSave = () => {
    if (selectedFile && selectedFile.type === 'file') {
      onSave({ ...selectedFile, content });
    }
  };

  const getLanguageFromExtension = (fileName: string): string => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'js':
      case 'jsx':
        return 'javascript';
      case 'ts':
      case 'tsx':
        return 'typescript';
      case 'py':
        return 'python';
      case 'html':
        return 'html';
      case 'css':
        return 'css';
      case 'json':
        return 'json';
      case 'java':
        return 'java';
      case 'c':
        return 'c';
      case 'cpp':
        return 'cpp';
      case 'cs':
        return 'csharp';
      case 'rb':
        return 'ruby';
      case 'php':
        return 'php';
      default:
        return 'plaintext';
    }
  };

  return (
    <div style={{ height: '100%' }}>
      {selectedFile ? (
        selectedFile.type === 'file' ? (
          isLoading ? (
            <div>Loading content...</div>
          ) : (
            <>
              <Editor
                height="90%"
                language={getLanguageFromExtension(selectedFile.name)}
                value={content}
                onChange={handleEditorChange}
              />
              <Button
                variant="leaf"
                size="leaf"
                state="inactive"
                weight="bold"
                font="body-base"
                className="uppercase text-white bg-terminal"
                onClick={handleSave}
              >
                Save
              </Button>
            </>
          )
        ) : (
          <div>Select a file to edit</div>
        )
      ) : (
        <div>Select a file to edit</div>
      )}
    </div>
  );
};

export default FileEditor;
