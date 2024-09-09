// src/types/react-contextmenu.d.ts
declare module 'react-contextmenu' {
    import * as React from 'react';

    export interface ContextMenuProps {
        id: string;
        data?: any;
        className?: string;
        hideOnLeave?: boolean;
        rtl?: boolean;
        onHide?: (event: any) => void;
        onMouseLeave?: (event: React.MouseEvent<HTMLElement>, data: Object, target: HTMLElement) => void;
        onShow?: (event: any) => void;
        preventHideOnContextMenu?: boolean;
        preventHideOnResize?: boolean;
        preventHideOnScroll?: boolean;
        style?: React.CSSProperties;
        children?: React.ReactNode; // Explicitly add children prop
    }

    export interface ContextMenuTriggerProps {
        id: string;
        attributes?: React.HTMLAttributes<any>;
        collect?: (data: any) => any;
        disable?: boolean;
        holdToDisplay?: number;
        renderTag?: React.ElementType;
        mouseButton?: number;
        disableIfShiftIsPressed?: boolean;
        children?: React.ReactNode; // Explicitly add children prop
    }

    export interface MenuItemProps {
        attributes?: React.HTMLAttributes<HTMLDivElement>;
        className?: string;
        data?: Object;
        disabled?: boolean;
        divider?: boolean;
        preventClose?: boolean;
        onClick?: (event: React.TouchEvent<HTMLDivElement> | React.MouseEvent<HTMLDivElement>, data: Object, target: HTMLElement) => void;
        children?: React.ReactNode; // Explicitly add children prop
    }

    export const ContextMenu: React.ComponentClass<ContextMenuProps>;
    export const ContextMenuTrigger: React.ComponentClass<ContextMenuTriggerProps>;
    export const MenuItem: React.ComponentClass<MenuItemProps>;
}
