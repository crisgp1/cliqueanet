import { useState } from 'react';
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

interface Customer {
  customer_id: number;
  name: string;
  identification_type: string;
  identification_number: string;
  birth_date: string;
  phone: string;
  email: string;
  address: string;
  curp: string;
}

const customersMock: Customer[] = [
  {
    customer_id: 1,
    name: "Ana López",
    identification_type: "INE",
    identification_number: "1234567890",
    birth_date: "1992-03-15",
    phone: "555-0125",
    email: "ana@ejemplo.com",
    address: "Calle Roble 789",
    curp: "LOPA920315MDFXXX01"
  },
  {
    customer_id: 2,
    name: "Carlos Ruiz",
    identification_type: "Pasaporte",
    identification_number: "A98765432",
    birth_date: "1985-11-20",
    phone: "555-0126",
    email: "carlos@ejemplo.com",
    address: "Avenida Pinos 321",
    curp: "RUIC851120HDFXXX02"
  }
];

export default function CustomersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [customers, setCustomers] = useState<Customer[]>(customersMock);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | undefined>(undefined);

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.curp.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.identification_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSave = (customerData: Omit<Customer, 'customer_id'>) => {
    if (selectedCustomer) {
      // Editar cliente existente
      setCustomers(customers.map(cust => 
        cust.customer_id === selectedCustomer.customer_id 
          ? { ...customerData, customer_id: selectedCustomer.customer_id }
          : cust
      ));
    } else {
      // Crear nuevo cliente
      const newCustomer = {
        ...customerData,
        customer_id: Math.max(...customers.map(c => c.customer_id)) + 1
      };
      setCustomers([...customers, newCustomer]);
    }
  };

  const handleEdit = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsModalOpen(true);
  };

  const handleDelete = (customerId: number) => {
    if (confirm('¿Está seguro que desea eliminar este cliente?')) {
      setCustomers(customers.filter(cust => cust.customer_id !== customerId));
    }
  };

  const handleAddNew = () => {
    setSelectedCustomer(undefined);
    setIsModalOpen(true);
  };

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
                placeholder="Buscar cliente por nombre, correo, CURP o número de identificación..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>CURP</TableHead>
                  <TableHead>Tipo de Identificación</TableHead>
                  <TableHead>Número de Identificación</TableHead>
                  <TableHead>Fecha Nacimiento</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead>Correo</TableHead>
                  <TableHead>Domicilio</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.map((customer) => (
                  <TableRow key={customer.customer_id}>
                    <TableCell className="font-medium">{customer.customer_id}</TableCell>
                    <TableCell>{customer.name}</TableCell>
                    <TableCell className="font-mono">{customer.curp}</TableCell>
                    <TableCell>{customer.identification_type}</TableCell>
                    <TableCell>{customer.identification_number}</TableCell>
                    <TableCell>{new Date(customer.birth_date).toLocaleDateString()}</TableCell>
                    <TableCell>{customer.phone}</TableCell>
                    <TableCell>{customer.email}</TableCell>
                    <TableCell className="max-w-[200px] truncate" title={customer.address}>
                      {customer.address}
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
                        onClick={() => handleDelete(customer.customer_id)}
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
      />
    </div>
  );
}