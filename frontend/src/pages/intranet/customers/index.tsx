import { useState, useEffect, ChangeEvent } from 'react';
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
import { CustomerModal } from '@/components/modals/CustomerModal';
import clienteService, { Cliente } from '@/services/cliente.service';
import tipoIdentificacionService, { TipoIdentificacion } from '@/services/tipo-identificacion.service';
import { toast } from '@/components/ui/use-toast';

export default function CustomersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [customers, setCustomers] = useState<Cliente[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Cliente | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [tiposIdentificacion, setTiposIdentificacion] = useState<TipoIdentificacion[]>([]);

  useEffect(() => {
    loadCustomers();
    loadTiposIdentificacion();
  }, []);

  const loadCustomers = async () => {
    try {
      const data = await clienteService.getAll();
      setCustomers(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los clientes",
        variant: "destructive"
      });
      console.error('Error al cargar clientes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadTiposIdentificacion = async () => {
    try {
      const data = await tipoIdentificacionService.getAll();
      setTiposIdentificacion(data);
    } catch (error) {
      console.error('Error al cargar tipos de identificación:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los tipos de identificación",
        variant: "destructive"
      });
    }
  };

  const filteredCustomers = customers.filter(customer =>
    customer.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.correo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (customer.curp && customer.curp.toLowerCase().includes(searchTerm.toLowerCase())) ||
    customer.numIdentificacion.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (customer.rfc && customer.rfc.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (customer.razonSocial && customer.razonSocial.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSave = async (customerData: Omit<Cliente, 'id'>) => {
    try {
      if (selectedCustomer) {
        // Editar cliente existente
        await clienteService.update(selectedCustomer.id, customerData);
        toast({
          title: "Éxito",
          description: "Cliente actualizado correctamente"
        });
      } else {
        // Crear nuevo cliente
        await clienteService.create(customerData);
        toast({
          title: "Éxito",
          description: "Cliente creado correctamente"
        });
      }
      loadCustomers();
      setIsModalOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo guardar el cliente",
        variant: "destructive"
      });
      console.error('Error al guardar cliente:', error);
    }
  };

  const handleEdit = (customer: Cliente) => {
    setSelectedCustomer(customer);
    setIsModalOpen(true);
  };

  const handleDelete = async (customerId: number) => {
    if (confirm('¿Está seguro que desea eliminar este cliente?')) {
      try {
        await clienteService.delete(customerId);
        toast({
          title: "Éxito",
          description: "Cliente eliminado correctamente"
        });
        loadCustomers();
      } catch (error) {
        toast({
          title: "Error",
          description: "No se pudo eliminar el cliente",
          variant: "destructive"
        });
        console.error('Error al eliminar cliente:', error);
      }
    }
  };

  const handleAddNew = () => {
    setSelectedCustomer(undefined);
    setIsModalOpen(true);
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-full">Cargando...</div>;
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Clientes</h2>
          <p className="text-muted-foreground">
            Gestiona la información de los clientes del sistema
          </p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleAddNew}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Cliente
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Clientes</CardTitle>
          <CardDescription>
            Total de clientes registrados: {customers.length}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Buscar por nombre, correo, CURP, RFC, razón social o número de identificación..."
                className="pl-8"
                value={searchTerm}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Identificación</TableHead>
                  <TableHead>RFC/CURP</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead>Correo</TableHead>
                  <TableHead>Domicilio</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell className="font-medium">{customer.id}</TableCell>
                    <TableCell>{customer.tipoPersona}</TableCell>
                    <TableCell>
                      {customer.tipoPersona === "Moral" ? (
                        <div>
                          <div>{customer.nombre}</div>
                          <div className="text-sm text-gray-500">{customer.razonSocial}</div>
                        </div>
                      ) : (
                        customer.nombre
                      )}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="text-sm text-gray-500">{customer.tipoIdentificacion?.nombre}</div>
                        <div>{customer.numIdentificacion}</div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono">
                      {customer.tipoPersona === "Moral" ? customer.rfc : customer.curp}
                    </TableCell>
                    <TableCell>{customer.telefono}</TableCell>
                    <TableCell>{customer.correo}</TableCell>
                    <TableCell className="max-w-[200px] truncate" title={customer.domicilio}>
                      {customer.domicilio}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-blue-600 hover:text-blue-700"
                        onClick={() => handleEdit(customer)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleDelete(customer.id)}
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

      <CustomerModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedCustomer(undefined);
        }}
        onSave={handleSave}
        customer={selectedCustomer}
        tiposIdentificacion={tiposIdentificacion}
      />
    </div>
  );
}