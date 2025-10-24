'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Button } from './button';
import { X } from 'lucide-react';
import { ScrollArea, ScrollBar } from './scroll-area';

interface SidePopupMenuProps extends React.HTMLAttributes<HTMLDivElement> {
  side?: 'left' | 'right';
  isOpen?: boolean;
}

function SidePopupMenu({ side, isOpen, children }: SidePopupMenuProps) {
  const [open, setOpen] = useState(isOpen ?? false);

  const closeMenu = () => setOpen(false);
  const toggleMenu = () => setOpen(!open);

  return (
    <>
      {React.Children.map(children, child => {
        if (!React.isValidElement(child)) return child;

        if (child.type === SidePopupMenuTrigger) {
          return React.cloneElement(child, {
            onClick: toggleMenu,
          } as SidePopupMenuTriggerProps);
        }

        if (child.type === SidePopupMenuContent) {
          return React.cloneElement(child, {
            isOpen: open,
            onClose: closeMenu,
            side,
          } as SidePopupMenuContentProps);
        }
      })}
    </>
  );
}

interface SidePopupMenuTriggerProps
  extends React.HTMLAttributes<HTMLButtonElement> {
  onClick?: () => void;
}

function SidePopupMenuTrigger({
  onClick,
  children,
}: SidePopupMenuTriggerProps) {
  return <div onClick={onClick}>{children}</div>;
}

interface SidePopupMenuContentProps
  extends React.HTMLAttributes<HTMLDivElement> {
  side?: 'left' | 'right';
  isOpen?: boolean;
  onClose?: () => void;
}

function SidePopupMenuContent({
  side = 'right',
  isOpen = false,
  onClose,
  children,
  className,
  ...props
}: SidePopupMenuContentProps) {
  const [shouldRender, setShouldRender] = useState(isOpen);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && shouldRender) {
      const id = setTimeout(() => setVisible(true), 10);
      return () => clearTimeout(id);
    } else {
      setVisible(false);
      const timeout = setTimeout(() => setShouldRender(false), 300);
      return () => clearTimeout(timeout);
    }
  }, [isOpen, shouldRender]);

  if (!shouldRender) return null;

  return createPortal(
    <div
      className={`fixed top-6 bottom-0 pb-6 z-10 p-6 max-w-96 w-full
        opacity-0 transition-all duration-300 ease-in-out pointer-events-none
        ${
          side === 'left'
            ? 'left-0 -translate-x-1/3'
            : 'right-0 translate-x-1/3'
        } 
        ${visible ? 'opacity-100 !translate-x-0' : ''} 
        ${className}`}
      {...props}
    >
      <div className="h-full flex flex-col min-h-0">
        <ScrollArea
          className="w-full bg-background border border-gray-300 shadow-lg 
          rounded-2xl pointer-events-auto max-h-full *:max-h-full"
        >
          <div className="p-4">
            {React.Children.map(children, child => {
              if (!React.isValidElement(child)) return child;

              if (child.type === SidePopupMenuHeader) {
                return React.cloneElement(child, {
                  onClick: onClose,
                } as SidePopupMenuHeaderProps);
              } else {
                return child;
              }
            })}
          </div>
          <ScrollBar orientation="vertical" />
        </ScrollArea>
      </div>
    </div>,
    document.body
  );
}

interface SidePopupMenuHeaderProps
  extends React.HTMLAttributes<HTMLDivElement> {
  onClick?: () => void;
}

function SidePopupMenuHeader({ onClick, children }: SidePopupMenuHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-3">
      {children}
      <Button
        onClick={onClick}
        variant="ghost"
        size="icon"
        className="cursor-pointer"
      >
        <X />
      </Button>
    </div>
  );
}

export {
  SidePopupMenu,
  SidePopupMenuTrigger,
  SidePopupMenuContent,
  SidePopupMenuHeader,
};
