import { useState, useEffect } from 'react';
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
import { empleadoService, IEmpleado } from '../../../services/empleado.service';
import { documentoService, DocumentosResponse } from '../../../services/documento.service';
import { toast } from '../../../components/ui/use-toast';

interface EmployeeWithDocuments extends IEmpleado {
  documentosInfo?: DocumentosResponse;
}

export default function EmployeesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [employees, setEmployees] = useState<EmployeeWithDocuments[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDocumentsModalOpen, setIsDocumentsModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeWithDocuments | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      setIsLoading(true);
      const empleadosData = await empleadoService.obtenerEmpleados();
      const empleadosConDocs = await Promise.all(
        empleadosData.map(async (emp) => {
          try {
            const docsInfo = await documentoService.obtenerDocumentosPorEmpleado(emp.id_empleado!);
            return {
              ...emp,
              documentosInfo: docsInfo
            };
          } catch (error) {
            console.error(`Error al obtener documentos del empleado ${emp.id_empleado}:`, error);
            return emp;
          }
        })
      );
      setEmployees(empleadosConDocs);
    } catch (error) {
      console.error('Error al cargar empleados:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los empleados",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getDocumentStatus = (employee: EmployeeWithDocuments) => {
    if (!employee.documentosInfo) return 'delayed';
    
    const lastDoc = employee.documentosInfo.documentos[0];
    if (!lastDoc) return 'delayed';
    
    const lastUpdate = new Date(lastDoc.fecha_subida);
    const today = new Date();
    const diffDays = Math.floor((today.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (!employee.documentosInfo.documentosPendientes) return 'complete';
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

  const handleSave = async (employeeData: IEmpleado) => {
    try {
      if (selectedEmployee?.id_empleado) {
        const updatedEmployee = await empleadoService.actualizarEmpleado(selectedEmployee.id_empleado, employeeData);
        setEmployees(employees.map(emp => 
          emp.id_empleado === selectedEmployee.id_empleado 
            ? { ...updatedEmployee, documentosInfo: emp.documentosInfo }
            : emp
        ));
        toast({
          title: "Éxito",
          description: "Empleado actualizado correctamente"
        });
      } else {
        const newEmployee = await empleadoService.crearEmpleado(employeeData);
        setEmployees([...employees, newEmployee]);
        toast({
          title: "Éxito",
          description: "Empleado creado correctamente"
        });
      }
      setIsModalOpen(false);
      setSelectedEmployee(undefined);
    } catch (error) {
      console.error('Error al guardar empleado:', error);
      toast({
        title: "Error",
        description: "No se pudo guardar el empleado",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (employee: EmployeeWithDocuments) => {
    setSelectedEmployee(employee);
    setIsModalOpen(true);
  };

  const handleDelete = async (employeeId: number) => {
    if (confirm('¿Está seguro que desea eliminar este empleado?')) {
      try {
        await empleadoService.desactivarEmpleado(employeeId);
        setEmployees(employees.filter(emp => emp.id_empleado !== employeeId));
        toast({
          title: "Éxito",
          description: "Empleado eliminado correctamente"
        });
      } catch (error) {
        console.error('Error al eliminar empleado:', error);
        toast({
          title: "Error",
          description: "No se pudo eliminar el empleado",
          variant: "destructive"
        });
      }
    }
  };

  const handleAddNew = () => {
    setSelectedEmployee(undefined);
    setIsModalOpen(true);
  };

  const handleViewDocuments = (employee: EmployeeWithDocuments) => {
    setSelectedEmployee(employee);
    setIsDocumentsModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

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