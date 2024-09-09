import React, { useEffect, useRef } from 'react';
import { Terminal } from 'xterm';
import 'xterm/css/xterm.css';
import { FitAddon } from 'xterm-addon-fit';
import { useWebSocket } from '@/contexts/websocketContext';

interface TerminalComponentProps {
  containerId: string;
}

const TerminalComponent: React.FC<TerminalComponentProps> = ({ containerId }) => {
  const terminalRef = useRef<HTMLDivElement | null>(null);
  const socket = useWebSocket(); // Use WebSocket context
  const terminalInstance = useRef<Terminal | null>(null);

  useEffect(() => {
    const terminal = new Terminal({
      cursorBlink: true,
      convertEol: true, // Converts \r\n to \n for proper newlines
      fontFamily: 'monospace',
      fontSize: 14,
      disableStdin: false, // Enable terminal input
      theme: {
        background: '#000000', // Set terminal background color to black
      },
    });

    const fitAddon = new FitAddon();
    terminal.loadAddon(fitAddon);
    terminalInstance.current = terminal;

    if (terminalRef.current) {
      terminal.open(terminalRef.current);
      fitAddon.fit();
      terminal.focus();

      // Start the terminal session
      socket.emit('start-terminal', { containerId });

      // Handle terminal output from the server
      socket.on('terminal-output', (data: string) => {
        terminal.write(data);
      });

      // Send terminal input to the server
      terminal.onData((data) => {
        socket.emit('terminal-input', data);
      });

      // Handle terminal errors
      socket.on('terminal-error', (error) => {
        terminal.write(`\r\nError: ${error}\r\n`);
      });

      // Handle socket disconnection
      socket.on('disconnect', () => {
        terminal.write('\r\nConnection closed\r\n');
      });

      // Resize terminal on window resize
      const handleResize = () => {
        fitAddon.fit();
      };
      window.addEventListener('resize', handleResize);

      // Clean up
      return () => {
        socket.off('terminal-output');
        socket.off('terminal-error');
        socket.off('disconnect');
        window.removeEventListener('resize', handleResize);
        terminal.dispose();
      };
    }
  }, [socket, containerId]);

  return <div ref={terminalRef} style={{ height: '100%', width: '100%' }}></div>;
};

export default TerminalComponent;
