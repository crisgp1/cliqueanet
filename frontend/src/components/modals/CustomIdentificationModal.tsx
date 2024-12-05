import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';

interface CustomIdentificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (identificationType: string) => void;
}

export function CustomIdentificationModal({ 
  isOpen, 
  onClose, 
  onSave 
}: CustomIdentificationModalProps) {
  const [customType, setCustomType] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customType.trim()) {
      onSave(customType.trim());
      setCustomType('');
      onClose();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    setCustomType(e.target.value);
  };

  const handleClose = () => {
    setCustomType('');
    onClose();
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={handleClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 animate-fade-in" />
        <Dialog.Content 
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg p-6 w-full max-w-[425px] shadow-lg animate-slide-up"
          onPointerDownOutside={(e) => {
            e.preventDefault();
          }}
        >
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <Dialog.Title className="text-lg font-semibold">
                Ingrese el Tipo de Identificación
              </Dialog.Title>
            </div>
            <div className="py-4">
              <input
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Escriba el tipo de identificación"
                value={customType}
                onChange={handleInputChange}
                onClick={(e: React.MouseEvent) => e.stopPropagation()}
                required
              />
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button
                type="button"
                className="px-4 py-2 border rounded-md hover:bg-gray-100"
                onClick={handleClose}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Guardar
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}