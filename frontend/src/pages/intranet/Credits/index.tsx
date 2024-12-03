import { SetStateAction, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Pencil, Trash2 } from 'lucide-react';
import { CreditsModal } from '@/components/modals/CreditsModal';

interface Credit {
  id_credito: number;
  id_cliente: number;
  cantidad: number;
  comentarios?: string;
  id_documento?: number;
  id_vehiculo?: number;
}

const creditsMock: Credit[] = [
  {
    id_credito: 1,
    id_cliente: 1,
    cantidad: 15000.50,
    comentarios: "Crédito para compra de vehículo",
    id_vehiculo: 1,
  },
  {
    id_credito: 2,
    id_cliente: 2,
    cantidad: 10000.75,
    comentarios: "Refinanciamiento",
    id_documento: 1
  }
];

export default function CreditsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [credits, setCredits] = useState<Credit[]>(creditsMock);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCredit, setSelectedCredit] = useState<Credit | undefined>(undefined);

  const filteredCredits = credits.filter(credit =>
    credit.id_cliente.toString().includes(searchTerm.toLowerCase()) ||
    (credit.comentarios?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
  );

  const handleSave = (creditData: Omit<Credit, 'id_credito'>) => {
    if (selectedCredit) {
      // Editar crédito existente
      setCredits(credits.map(cred => 
        cred.id_credito === selectedCredit.id_credito 
          ? { ...creditData, id_credito: selectedCredit.id_credito }
          : cred
      ));
    } else {
      // Crear nuevo crédito
      const newCredit = {
        ...creditData,
        id_credito: credits.length > 0 
          ? Math.max(...credits.map(c => c.id_credito)) + 1 
          : 1
      };
      setCredits([...credits, newCredit]);
    }
  };

  const handleEdit = (credit: Credit) => {
    setSelectedCredit(credit);
    setIsModalOpen(true);
  };

  const handleDelete = (creditId: number) => {
    if (window.confirm('¿Está seguro que desea eliminar este crédito?')) {
      setCredits(credits.filter(cred => cred.id_credito !== creditId));
    }
  };

  const handleAddNew = () => {
    setSelectedCredit(undefined);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Créditos</h2>
          <p className="text-muted-foreground">
            Gestiona la información de los créditos del sistema
          </p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleAddNew}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Crédito
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Créditos</CardTitle>
          <CardDescription>
            Total de créditos registrados: {credits.length}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Buscar crédito por ID de cliente o comentarios..."
                className="pl-8"
                value={searchTerm}
                onChange={(e: { target: { value: SetStateAction<string>; }; }) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID Crédito</TableHead>
                  <TableHead>ID Cliente</TableHead>
                  <TableHead>Cantidad</TableHead>
                  <TableHead>Comentarios</TableHead>
                  <TableHead>ID Documento</TableHead>
                  <TableHead>ID Vehículo</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCredits.map((credit) => (
                  <TableRow key={credit.id_credito}>
                    <TableCell className="font-medium">{credit.id_credito}</TableCell>
                    <TableCell>{credit.id_cliente}</TableCell>
                    <TableCell>
                      {credit.cantidad.toLocaleString('es-MX', { 
                        style: 'currency', 
                        currency: 'MXN' 
                      })}
                    </TableCell>
                    <TableCell>{credit.comentarios || 'N/A'}</TableCell>
                    <TableCell>{credit.id_documento || 'N/A'}</TableCell>
                    <TableCell>{credit.id_vehiculo || 'N/A'}</TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-blue-600 hover:text-blue-700"
                        onClick={() => handleEdit(credit)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleDelete(credit.id_credito)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <CreditsModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedCredit(undefined);
        }}
        onSave={handleSave}
        credit={selectedCredit}
      />
    </div>
  );
}