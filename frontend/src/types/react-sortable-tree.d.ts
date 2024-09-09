// src/types/react-sortable-tree.d.ts
declare module 'react-sortable-tree' {
    import * as React from 'react';
  
    export interface TreeItem {
      title: string | React.ReactNode;
      subtitle?: string | React.ReactNode;
      expanded?: boolean;
      children?: TreeItem[] | TreeItem;
      [key: string]: any;
    }
  
    export interface TreeNode {
      node: TreeItem;
      lowerSiblingCounts: number[];
      path: number[];
      treeIndex: number;
    }
  
    export interface OnMovePreviousAndNextLocation {
      node: TreeItem;
      treeIndex: number;
      path: number[];
    }
  
    export interface NodeData {
      node: TreeItem;
      path: number[];
      treeIndex: number;
    }
  
    export interface FullNodeDragParams {
      treeData: TreeItem[];
      path: number[];
      node: TreeItem;
    }
  
    export interface ReactSortableTreeProps {
      treeData: TreeItem[];
      onChange: (treeData: TreeItem[]) => void;
      getNodeKey?: (data: TreeNode) => string | number;
      generateNodeProps?: (data: TreeNode) => { [key: string]: any };
      onMoveNode?: (data: FullNodeDragParams & {
        nextParentNode: TreeItem | null;
      }) => void;
      maxDepth?: number;
      canDrag?: boolean | ((data: NodeData) => boolean);
      canDrop?: (data: {
        node: TreeItem;
        prevPath: number[];
        prevParent: TreeItem | null;
        nextPath: number[];
        nextParent: TreeItem | null;
      }) => boolean;
      reactVirtualizedListProps?: { [key: string]: any };
      rowHeight?: number | ((info: { index: number }) => number);
      scaffoldBlockPxWidth?: number;
      slideRegionSize?: number;
      style?: React.CSSProperties;
      innerStyle?: React.CSSProperties;
      className?: string;
    }
  
    export default class ReactSortableTree extends React.Component<ReactSortableTreeProps, any> {}
    export function addNodeUnderParent(data: {
      treeData: TreeItem[];
      newNode: TreeItem;
      parentKey?: string | number;
      getNodeKey: (data: TreeNode) => string | number;
      expandParent?: boolean;
      addAsFirstChild?: boolean;
    }): { treeData: TreeItem[]; treeIndex: number; path: number[] };
  
    export function removeNodeAtPath(data: {
      treeData: TreeItem[];
      path: number[];
      getNodeKey: (data: TreeNode) => string | number;
    }): TreeItem[];
  
    export function changeNodeAtPath(data: {
      treeData: TreeItem[];
      path: number[];
      newNode: TreeItem;
      getNodeKey: (data: TreeNode) => string | number;
    }): TreeItem[];
  }
  