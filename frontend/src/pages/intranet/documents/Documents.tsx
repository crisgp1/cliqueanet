import { useState, useEffect } from 'react';
import { FileText, Upload, Filter, Search, Check, X, AlertCircle } from 'lucide-react';
import { documentoService, Documento, EntidadOrigen } from '../../../services/documento.service';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Card } from '../../../components/ui/card';
import { useToast } from '../../../components/ui/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';

type EstadoDocumento = 'pendiente' | 'aprobado' | 'rechazado';

const Documents = () => {
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEntidad, setSelectedEntidad] = useState<EntidadOrigen | ''>('');
  const [selectedEstado, setSelectedEstado] = useState<EstadoDocumento | ''>('');
  const { toast } = useToast();

  useEffect(() => {
    cargarDocumentos();
  }, []);

  const cargarDocumentos = async () => {
    try {
      setLoading(true);
      const docs = await documentoService.obtenerDocumentos();
      setDocumentos(docs);
    } catch (error) {
      console.error('Error al cargar documentos:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los documentos',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files?.length) return;

    try {
      const file = files[0];
      const newDoc = await documentoService.crearDocumento({
        nombre: file.name,
        tipo: 'Otro',
        archivo: file,
        descripcion: 'Documento subido desde la sección de documentos',
      });

      setDocumentos(prev => [newDoc, ...prev]);
      toast({
        title: 'Éxito',
        description: 'Documento subido correctamente',
      });
    } catch (error) {
      console.error('Error al subir documento:', error);
      toast({
        title: 'Error',
        description: 'No se pudo subir el documento',
        variant: 'destructive',
      });
    }
  };

  const handleAprobarDocumento = async (id: number) => {
    try {
      const docActualizado = await documentoService.aprobarDocumento(id, 1); // TODO: Obtener el ID del usuario actual
      setDocumentos(prev => prev.map(doc => doc.id === id ? docActualizado : doc));
      toast({
        title: 'Éxito',
        description: 'Documento aprobado correctamente',
      });
    } catch (error) {
      console.error('Error al aprobar documento:', error);
      toast({
        title: 'Error',
        description: 'No se pudo aprobar el documento',
        variant: 'destructive',
      });
    }
  };

  const handleRechazarDocumento = async (id: number) => {
    try {
      const docActualizado = await documentoService.rechazarDocumento(id, 1); // TODO: Obtener el ID del usuario actual
      setDocumentos(prev => prev.map(doc => doc.id === id ? docActualizado : doc));
      toast({
        title: 'Éxito',
        description: 'Documento rechazado correctamente',
      });
    } catch (error) {
      console.error('Error al rechazar documento:', error);
      toast({
        title: 'Error',
        description: 'No se pudo rechazar el documento',
        variant: 'destructive',
      });
    }
  };

  const handleEntidadChange = (value: string) => {
    setSelectedEntidad(value as EntidadOrigen | '');
  };

  const handleEstadoChange = (value: string) => {
    setSelectedEstado(value as EstadoDocumento | '');
  };

  const filteredDocumentos = documentos.filter(doc => {
    const matchesSearch = doc.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.descripcion?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEntidad = !selectedEntidad || doc.entidad_origen === selectedEntidad;
    const matchesEstado = !selectedEstado || doc.estado === selectedEstado;
    return matchesSearch && matchesEntidad && matchesEstado;
  });

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'aprobado': return 'text-green-600 bg-green-100';
      case 'rechazado': return 'text-red-600 bg-red-100';
      default: return 'text-yellow-600 bg-yellow-100';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Documentos</h1>
        <div className="flex gap-2">
          <Input
            type="file"
            id="file-upload"
            className="hidden"
            onChange={handleFileUpload}
            accept=".pdf,.jpg,.png,.xml"
          />
          <label htmlFor="file-upload">
            <Button variant="outline" className="cursor-pointer" asChild>
              <span>
                <Upload className="w-4 h-4 mr-2" />
                Subir Documento
              </span>
            </Button>
          </label>
        </div>
      </div>

      <div className="flex gap-4 items-center">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Buscar documentos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={selectedEntidad} onValueChange={handleEntidadChange}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Todas las entidades" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todas las entidades</SelectItem>
            <SelectItem value="cliente">Cliente</SelectItem>
            <SelectItem value="empleado">Empleado</SelectItem>
            <SelectItem value="vehiculo">Vehículo</SelectItem>
            <SelectItem value="transaccion">Transacción</SelectItem>
            <SelectItem value="general">General</SelectItem>
          </SelectContent>
        </Select>
        <Select value={selectedEstado} onValueChange={handleEstadoChange}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Todos los estados" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todos los estados</SelectItem>
            <SelectItem value="pendiente">Pendiente</SelectItem>
            <SelectItem value="aprobado">Aprobado</SelectItem>
            <SelectItem value="rechazado">Rechazado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDocumentos.map((doc) => (
          <Card key={doc.id} className="p-4 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <FileText className="w-8 h-8 text-blue-600" />
                <div>
                  <h3 className="font-medium text-gray-900">{doc.nombre}</h3>
                  <p className="text-sm text-gray-500">{doc.descripcion}</p>
                </div>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor(doc.estado)}`}>
                {doc.estado}
              </span>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-600">
                Entidad: {doc.entidad_origen}
              </p>
              <p className="text-sm text-gray-600">
                Subido: {new Date(doc.fecha_subida).toLocaleDateString()}
              </p>
            </div>
            <div className="mt-4 flex justify-end space-x-2">
              {doc.estado === 'pendiente' && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-green-600 hover:text-green-700"
                    onClick={() => handleAprobarDocumento(doc.id)}
                  >
                    <Check className="w-4 h-4 mr-1" />
                    Aprobar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => handleRechazarDocumento(doc.id)}
                  >
                    <X className="w-4 h-4 mr-1" />
                    Rechazar
                  </Button>
                </>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(doc.url, '_blank')}
              >
                Ver Documento
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {filteredDocumentos.length === 0 && (
        <div className="flex flex-col items-center justify-center h-48 text-gray-500">
          <AlertCircle className="w-12 h-12 mb-2" />
          <p>No se encontraron documentos</p>
        </div>
      )}
    </div>
  );
};

export default Documents;