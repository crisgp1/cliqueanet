import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Search, Plus, Pencil, Trash2, Eye } from 'lucide-react';
import { EmployeeModal } from '../../../components/modals/EmployeeModal';
import { ViewEmployeeDocumentsModal } from '../../../components/modals/ViewEmployeeDocumentsModal';

interface Employee {
  id_empleado?: number;
  nombre: string;
  id_tipo_identificacion: number;
  num_identificacion: string;
  curp: string;
  fecha_nacimiento: string;
  telefono: string;
  correo: string;
  domicilio: string;
  fecha_contratacion: string;
  id_rol: number;
  comentarios?: string;
  expediente_completo?: boolean;
  tipo_documento?: string;
  last_document_scan?: string;
  documents_status?: 'complete' | 'pending' | 'delayed';
}

const employeesMock: Employee[] = [
  {
    id_empleado: 1,
    nombre: "Juan Pérez",
    id_tipo_identificacion: 1,
    num_identificacion: "PERJ870519",
    curp: "PERJ870519HDFLRN02",
    fecha_nacimiento: "1990-05-15",
    telefono: "555-0123",
    correo: "juan@ejemplo.com",
    domicilio: "Calle Principal 123",
    fecha_contratacion: "2023-01-01",
    id_rol: 2,
    last_document_scan: "2024-01-15",
    documents_status: "complete"
  },
  {
    id_empleado: 2,
    nombre: "María García",
    id_tipo_identificacion: 2,
    num_identificacion: "GAGM880820",
    curp: "GAGM880820MDFLRA02",
    fecha_nacimiento: "1988-08-20",
    telefono: "555-0124",
    correo: "maria@ejemplo.com",
    domicilio: "Avenida Central 456",
    fecha_contratacion: "2023-02-01",
    id_rol: 3,
    last_document_scan: "2024-01-10",
    documents_status: "pending"
  }
];

export default function EmployeesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [employees, setEmployees] = useState<Employee[]>(employeesMock);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDocumentsModalOpen, setIsDocumentsModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | undefined>(undefined);

  const getDocumentStatus = (employee: Employee) => {
    if (!employee.last_document_scan) return 'delayed';
    
    const lastScan = new Date(employee.last_document_scan);
    const today = new Date();
    const diffDays = Math.floor((today.getTime() - lastScan.getTime()) / (1000 * 60 * 60 * 24));
    
    if (employee.documents_status === 'complete') return 'complete';
    if (diffDays > 5) return 'delayed';
    return 'pending';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'complete':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'delayed':
        return 'bg-red-100 text-red-800';
      default:
        return '';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'complete':
        return 'Expediente completo';
      case 'pending':
        return 'Pendiente';
      case 'delayed':
        return 'Captura atrasada';
      default:
        return '';
    }
  };

  const filteredEmployees = employees.filter(employee =>
    employee.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.correo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSave = (employeeData: Employee) => {
    if (selectedEmployee) {
      setEmployees(employees.map(emp => 
        emp.id_empleado === selectedEmployee.id_empleado 
          ? { ...employeeData, id_empleado: selectedEmployee.id_empleado }
          : emp
      ));
    } else {
      const newEmployee = {
        ...employeeData,
        id_empleado: Math.max(...employees.map(e => e.id_empleado || 0)) + 1
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
      setEmployees(employees.filter(emp => emp.id_empleado !== employeeId));
    }
  };

  const handleAddNew = () => {
    setSelectedEmployee(undefined);
    setIsModalOpen(true);
  };

  const handleViewDocuments = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsDocumentsModalOpen(true);
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
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
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
                  <TableHead>Estado Documentos</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees.map((employee) => {
                  const status = getDocumentStatus(employee);
                  return (
                    <TableRow key={employee.id_empleado}>
                      <TableCell className="font-medium">{employee.id_empleado}</TableCell>
                      <TableCell>{employee.nombre}</TableCell>
                      <TableCell>{new Date(employee.fecha_nacimiento).toLocaleDateString()}</TableCell>
                      <TableCell>{employee.curp}</TableCell>
                      <TableCell>{employee.telefono}</TableCell>
                      <TableCell>{employee.correo}</TableCell>
                      <TableCell className="max-w-[200px] truncate" title={employee.domicilio}>
                        {employee.domicilio}
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(status)}`}>
                          {getStatusText(status)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="text-purple-600 hover:text-purple-700"
                          onClick={() => handleViewDocuments(employee)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
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
                          onClick={() => handleDelete(employee.id_empleado!)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
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

      {selectedEmployee && (
        <ViewEmployeeDocumentsModal
          isOpen={isDocumentsModalOpen}
          onClose={() => {
            setIsDocumentsModalOpen(false);
            setSelectedEmployee(undefined);
          }}
          employee={selectedEmployee}
        />
      )}
    </div>
  );
}