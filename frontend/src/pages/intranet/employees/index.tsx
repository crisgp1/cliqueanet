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
import { EmployeeModal } from '@/components/modals/EmployeeModal';

interface Employee {
  employee_id: number;
  name: string;
  identification_type: string;
  identification_number: string;
  curp: string;
  birth_date: string;
  phone: string;
  email: string;
  address: string;
}

const employeesMock: Employee[] = [
  {
    employee_id: 1,
    name: "Juan Pérez",
    identification_type: "INE",
    identification_number: "PERJ870519",
    curp: "PERJ870519HDFLRN02",
    birth_date: "1990-05-15",
    phone: "555-0123",
    email: "juan@ejemplo.com",
    address: "Calle Principal 123"
  },
  {
    employee_id: 2,
    name: "María García",
    identification_type: "Pasaporte",
    identification_number: "GAGM880820",
    curp: "GAGM880820MDFLRA02",
    birth_date: "1988-08-20",
    phone: "555-0124",
    email: "maria@ejemplo.com",
    address: "Avenida Central 456"
  }
];

export default function EmployeesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [employees, setEmployees] = useState<Employee[]>(employeesMock);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | undefined>(undefined);

  const filteredEmployees = employees.filter(employee =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSave = (employeeData: Omit<Employee, 'employee_id'>) => {
    if (selectedEmployee) {
      // Editar empleado existente
      setEmployees(employees.map(emp => 
        emp.employee_id === selectedEmployee.employee_id 
          ? { ...employeeData, employee_id: selectedEmployee.employee_id }
          : emp
      ));
    } else {
      // Crear nuevo empleado
      const newEmployee = {
        ...employeeData,
        employee_id: Math.max(...employees.map(e => e.employee_id)) + 1
      };
      setEmployees([...employees, newEmployee]);
    }
  };

  const handleEdit = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsModalOpen(true);
  };

  const handleDelete = (employeeId: number) => {
    if (confirm('¿Está seguro que desea eliminar este empleado?')) {
      setEmployees(employees.filter(emp => emp.employee_id !== employeeId));
    }
  };

  const handleAddNew = () => {
    setSelectedEmployee(undefined);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Empleados</h2>
          <p className="text-muted-foreground">
            Gestiona la información de los empleados del sistema
          </p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleAddNew}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Empleado
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Empleados</CardTitle>
          <CardDescription>
            Total de empleados registrados: {employees.length}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Buscar empleado por nombre o correo..."
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
                  <TableHead>Fecha Nacimiento</TableHead>
                  <TableHead>CURP</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead>Correo</TableHead>
                  <TableHead>Domicilio</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees.map((employee) => (
                  <TableRow key={employee.employee_id}>
                    <TableCell className="font-medium">{employee.employee_id}</TableCell>
                    <TableCell>{employee.name}</TableCell>
                    <TableCell>{new Date(employee.birth_date).toLocaleDateString()}</TableCell>
                    <TableCell>{employee.curp}</TableCell>
                    <TableCell>{employee.phone}</TableCell>
                    <TableCell>{employee.email}</TableCell>
                    <TableCell className="max-w-[200px] truncate" title={employee.address}>
                      {employee.address}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-blue-600 hover:text-blue-700"
                        onClick={() => handleEdit(employee)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleDelete(employee.employee_id)}
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

      <EmployeeModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedEmployee(undefined);
        }}
        onSave={handleSave}
        employee={selectedEmployee}
      />
    </div>
  );
}