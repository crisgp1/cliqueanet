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
          max-w-[95vw] w-full 
          ${maxWidthClasses[maxWidth]}
          max-h-[90vh] 
          overflow-hidden 
          flex 
          flex-col
          relative
          ${className}
        `}
      >
        {isLoading && <LoaderOverlay />}
        
        {showHeader && (
          <DialogHeader className="px-6 py-4 border-b">
            <DialogTitle>
              {title}
            </DialogTitle>
          </DialogHeader>
        )}

        <div className="flex-1 overflow-y-auto px-6 py-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          {children}
        </div>

        {showFooter && footer && (
          <DialogFooter className="px-6 py-4 border-t">
            {footer}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

// Componente de ejemplo de uso:
/*
export function ExampleModal({ isOpen, onClose }) {
  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Título del Modal"
      maxWidth="md"
      isLoading={false} // Controla el estado de carga
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit">
            Guardar
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <p>Contenido del modal...</p>
      </div>
    </BaseModal>
  );
}
*/