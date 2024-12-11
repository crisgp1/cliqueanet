import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { 
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { HelpCircle } from "lucide-react";

const idLocations = {
  "INE": {
    title: "Número de Credencial de Elector (INE)",
    description: "El número de identificación se encuentra en el frente de tu INE, es una cadena de 13 dígitos ubicada en la esquina inferior izquierda.",
    image: (
      <div className="bg-gray-100 p-4 rounded-lg">
        <div className="w-full h-48 bg-white rounded-lg border-2 border-gray-300 p-4 relative">
          {/* Simulación de INE */}
          <div className="absolute top-2 left-2 text-sm font-bold">INSTITUTO NACIONAL ELECTORAL</div>
          <div className="absolute bottom-16 left-4 w-24 h-32 bg-gray-200 rounded"></div>
          <div className="absolute bottom-4 left-4 bg-yellow-100 p-1 rounded">
            <span className="text-sm font-mono">IDMEX1234567890</span>
          </div>
        </div>
      </div>
    )
  },
  "PASAPORTE": {
    title: "Número de Pasaporte",
    description: "El número de pasaporte se encuentra en la parte superior derecha de la página principal, consta de 8 o 9 caracteres alfanuméricos.",
    image: (
      <div className="bg-gray-100 p-4 rounded-lg">
        <div className="w-full h-48 bg-blue-900 rounded-lg border-2 border-gray-300 p-4 relative">
          {/* Simulación de Pasaporte */}
          <div className="absolute top-2 left-2 text-white">PASAPORTE</div>
          <div className="absolute top-2 right-2 bg-yellow-100 p-1 rounded">
            <span className="text-sm font-mono">G12345678</span>
          </div>
          <div className="absolute bottom-4 left-4 w-24 h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  },
  "TARJETA_RESIDENCIA": {
    title: "Número de Tarjeta de Residencia",
    description: "El número de residencia se encuentra en la esquina superior derecha del frente de la tarjeta, es una secuencia de 13 caracteres alfanuméricos.",
    image: (
      <div className="bg-gray-100 p-4 rounded-lg">
        <div className="w-full h-48 bg-green-900 rounded-lg border-2 border-gray-300 p-4 relative">
          {/* Simulación de Tarjeta de Residencia */}
          <div className="absolute top-2 left-2 text-white">TARJETA DE RESIDENCIA</div>
          <div className="absolute top-2 right-2 bg-yellow-100 p-1 rounded">
            <span className="text-sm font-mono">RTD123456789</span>
          </div>
          <div className="absolute bottom-4 left-4 w-24 h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }
};

export function IdentificationHelper({ 
  selectedType 
}: { 
  selectedType: string 
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const idInfo = idLocations[selectedType as keyof typeof idLocations];

  if (!idInfo) return null;

  return (
    <div className="inline-flex items-center">
      <HoverCard>
        <HoverCardTrigger asChild>
          <button 
            type="button"
            className="inline-flex items-center text-blue-600 hover:text-blue-800"
            onClick={() => setIsModalOpen(true)}
          >
            <HelpCircle className="w-4 h-4 mr-1" />
            <span className="text-sm">¿Dónde encuentro el número?</span>
          </button>
        </HoverCardTrigger>
        <HoverCardContent className="w-80">
          <div className="space-y-2">
            <h4 className="font-semibold">{idInfo.title}</h4>
            <p className="text-sm text-gray-600">{idInfo.description}</p>
            <p className="text-sm text-blue-600 cursor-pointer" onClick={() => setIsModalOpen(true)}>
              Click para ver imagen
            </p>
          </div>
        </HoverCardContent>
      </HoverCard>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{idInfo.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">{idInfo.description}</p>
            {idInfo.image}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Ejemplo de uso en el formulario de cliente
export function IdNumberField({ 
  value,
  onChange,
  selectedIdType 
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  selectedIdType: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label htmlFor="numIdentificacion" className="text-sm font-medium">
          Número de Identificación
        </label>
        <IdentificationHelper selectedType={selectedIdType} />
      </div>
      <input
        id="numIdentificacion"
        name="numIdentificacion"
        value={value}
        onChange={onChange}
        className="w-full border rounded-md p-2"
        required
      />
    </div>
  );
}