import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Ingrese el Tipo de Identificación</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Escriba el tipo de identificación"
              value={customType}
              onChange={(e) => setCustomType(e.target.value)}
              required
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">Guardar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}