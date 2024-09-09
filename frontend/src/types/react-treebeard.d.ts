declare module 'react-treebeard' {
    import * as React from 'react';
  
    export interface TreebeardProps {
      data: any;
      onToggle: (node: any, toggled: boolean) => void;
      decorators?: any;
      animations?: any;
      style?: any;
    }
  
    export class Treebeard extends React.Component<TreebeardProps> {}
  
    export const decorators: any;
  }
  