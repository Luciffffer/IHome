'use client';

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Button } from './button';
import { X } from 'lucide-react';
import { ScrollArea, ScrollBar } from './scroll-area';

const ANIMATION_MS = 300;

type Side = 'left' | 'right';

interface SidePopupMenuProps extends React.HTMLAttributes<HTMLDivElement> {
  side?: Side;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onAnimationComplete?: () => void;
}

function SidePopupMenu({
  side,
  isOpen: controlledOpen,
  onOpenChange,
  onAnimationComplete,
  children,
}: SidePopupMenuProps) {
  const [internalOpen, setInternalOpen] = useState(false);

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;

  const closeMenu = () => {
    if (isControlled) {
      onOpenChange?.(false);
    } else {
      setInternalOpen(false);
    }
  };
  const toggleMenu = () => {
    if (isControlled) {
      onOpenChange?.(!controlledOpen);
    } else {
      setInternalOpen(!internalOpen);
    }
  };

  let triggerElement: React.ReactElement | null = null;
  let contentElement: React.ReactElement | null = null;

  React.Children.forEach(children, child => {
    if (!React.isValidElement(child)) return;

    if (child.type === SidePopupMenuTrigger) {
      triggerElement = child;
    } else if (child.type === SidePopupMenuContent) {
      contentElement = child;
    }
  });

  return (
    <>
      {triggerElement &&
        React.cloneElement(triggerElement, {
          onClick: toggleMenu,
        })}

      {contentElement &&
        React.cloneElement(contentElement, {
          isOpen: open,
          onClose: closeMenu,
          onAnimationComplete,
          side,
        })}
    </>
  );
}

interface SidePopupMenuTriggerProps
  extends React.HTMLAttributes<HTMLDivElement> {
  onClick?: () => void;
}

function SidePopupMenuTrigger({
  onClick,
  children,
  ...rest
}: SidePopupMenuTriggerProps) {
  return (
    <div onClick={onClick} {...rest}>
      {children}
    </div>
  );
}

interface SidePopupMenuContentProps
  extends React.HTMLAttributes<HTMLDivElement> {
  side?: Side;
  isOpen?: boolean;
  onClose?: () => void;
  onAnimationComplete?: () => void;
}

function SidePopupMenuContent({
  side = 'right',
  isOpen = false,
  onClose,
  onAnimationComplete,
  children,
  className,
  ...props
}: SidePopupMenuContentProps) {
  const [shouldRender, setShouldRender] = useState(isOpen);
  const [visible, setVisible] = useState(isOpen);

  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      const id = setTimeout(() => setVisible(true), 30);
      return () => clearTimeout(id);
    } else {
      setVisible(false);
      timeoutRef.current = window.setTimeout(() => {
        setShouldRender(false);
        onAnimationComplete?.();
      }, ANIMATION_MS);

      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
      };
    }
  }, [isOpen, onAnimationComplete]);

  // Cleanup timers
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  if (!shouldRender) return null;

  return createPortal(
    <div
      className={`fixed top-6 bottom-0 pb-6 z-10 p-6 max-w-96 w-full
        transition-all duration-300 ease-in-out pointer-events-none
        ${
          side === 'left'
            ? 'left-0 -translate-x-1/3'
            : 'right-0 translate-x-1/3'
        } 
        ${
          visible
            ? 'opacity-100 !translate-x-0 pointer-events-auto'
            : 'pointer-events-none opacity-0'
        } 
        ${className}`}
      {...props}
    >
      <div className="h-full flex flex-col min-h-0">
        <ScrollArea
          className="w-full bg-background border border-muted shadow-lg 
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
