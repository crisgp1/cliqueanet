import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./dialog";
import { LoaderOverlay } from './loader';

interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string | React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  showHeader?: boolean;
  showFooter?: boolean;
  className?: string;
  isLoading?: boolean;
}

const maxWidthClasses = {
  sm: 'sm:max-w-[425px]',
  md: 'sm:max-w-[600px]',
  lg: 'sm:max-w-[800px]',
  xl: 'sm:max-w-[1024px]',
  '2xl': 'sm:max-w-[1280px]',
  'full': 'sm:max-w-[95vw]'
};

export function BaseModal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  maxWidth = 'md',
  showHeader = true,
  showFooter = true,
  className = '',
  isLoading = false
}: BaseModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className={`
          ${maxWidthClasses[maxWidth]}
          ${className}
          grid
          gap-4
          bg-background
          p-0
          shadow-lg
          duration-200
          sm:rounded-lg
        `}
      >
        {isLoading && <LoaderOverlay />}
        
        {showHeader && (
          <DialogHeader className="sticky top-0 z-50 px-6 py-4 border-b bg-background">
            <DialogTitle>
              {title}
            </DialogTitle>
          </DialogHeader>
        )}

        <div className="px-6 py-4 overflow-y-auto max-h-[calc(90vh-8rem)] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          {children}
        </div>

        {showFooter && footer && (
          <DialogFooter className="sticky bottom-0 z-50 px-6 py-4 border-t bg-background">
            {footer}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}