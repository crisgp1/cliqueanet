import { useState, ChangeEvent, useEffect } from 'react';
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
import { Search, Plus, Trash2, FileText, Eye } from 'lucide-react';
import { TransactionsModal } from '../../../components/modals/TransactionsModal';
import { DocumentsModal } from '../../../components/modals/DocumentsModal';
import { ViewDocumentsModal } from '../../../components/modals/ViewDocumentsModal';
import transaccionService, { Transaccion } from '../../../services/transaccion.service';
import { toast } from '../../../components/ui/use-toast';

interface TransactionDisplay extends Transaccion {
  clienteNombre: string;
  vehiculoModelo: string;
  tipoTransaccionNombre: string;
  documentosPendientes: boolean;
}

export default function TransactionsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [transactions, setTransactions] = useState<TransactionDisplay[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDocumentsModalOpen, setIsDocumentsModalOpen] = useState(false);
  const [isViewDocumentsModalOpen, setIsViewDocumentsModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionDisplay | undefined>(undefined);
  const [selectedTransactionId, setSelectedTransactionId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      const data = await transaccionService.getAll();
      const formattedTransactions: TransactionDisplay[] = data.map(trans => ({
        ...trans,
        clienteNombre: trans.cliente?.nombre || 'N/A',
        vehiculoModelo: `${trans.vehiculo?.marca} ${trans.vehiculo?.modelo} ${trans.vehiculo?.anio}` || 'N/A',
        tipoTransaccionNombre: trans.tipoTransaccion?.nombre || 'N/A',
        documentosPendientes: true // Esto debería venir del backend
      }));
      setTransactions(formattedTransactions);
    } catch (error) {
      console.error('Error al cargar transacciones:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las transacciones",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTransactions = transactions.filter(transaction =>
    transaction.clienteNombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.vehiculoModelo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.tipoTransaccionNombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    new Date(transaction.fecha).toLocaleDateString().toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSave = async (transactionData: Transaccion) => {
    try {
      if (selectedTransaction) {
        // Edit existing transaction
        const updated = await transaccionService.update(selectedTransaction.id, {
          idUsuario: transactionData.idUsuario,
          idCliente: transactionData.idCliente,
          idVehiculo: transactionData.idVehiculo,
          idCredito: transactionData.idCredito,
          idTipoTransaccion: transactionData.idTipoTransaccion
        });
        setTransactions(transactions.map(trans =>
          trans.id === selectedTransaction.id
            ? {
              ...trans,
              ...updated,
              clienteNombre: updated.cliente?.nombre || 'N/A',
              vehiculoModelo: `${updated.vehiculo?.marca} ${updated.vehiculo?.modelo} ${updated.vehiculo?.anio}` || 'N/A',
              tipoTransaccionNombre: updated.tipoTransaccion?.nombre || 'N/A'
            }
            : trans
        ));
        toast({
          title: "Éxito",
          description: "Transacción actualizada correctamente"
        });
      } else {
        // Create new transaction
        const created = await transaccionService.create({
          idUsuario: transactionData.idUsuario,
          idCliente: transactionData.idCliente,
          idVehiculo: transactionData.idVehiculo,
          idCredito: transactionData.idCredito,
          idTipoTransaccion: transactionData.idTipoTransaccion
        });
        const newTransaction: TransactionDisplay = {
          ...created,
          clienteNombre: created.cliente?.nombre || 'N/A',
          vehiculoModelo: `${created.vehiculo?.marca} ${created.vehiculo?.modelo} ${created.vehiculo?.anio}` || 'N/A',
          tipoTransaccionNombre: created.tipoTransaccion?.nombre || 'N/A',
          documentosPendientes: true
        };
        setTransactions([...transactions, newTransaction]);
        toast({
          title: "Éxito",
          description: "Transacción creada correctamente"
        });
      }
    } catch (error) {
      console.error('Error al guardar transacción:', error);
      toast({
        title: "Error",
        description: "No se pudo guardar la transacción",
        variant: "destructive"
      });
    }
    setIsModalOpen(false);
    setSelectedTransaction(undefined);
  };

  const handleEdit = (transaction: TransactionDisplay) => {
    setSelectedTransaction(transaction);
    setIsModalOpen(true);
  };

  const handleDelete = async (transactionId: number) => {
    if (confirm('¿Está seguro que desea eliminar esta transacción?')) {
      try {
        await transaccionService.delete(transactionId);
        setTransactions(transactions.filter(trans => trans.id !== transactionId));
        toast({
          title: "Éxito",
          description: "Transacción eliminada correctamente"
        });
      } catch (error) {
        console.error('Error al eliminar transacción:', error);
        toast({
          title: "Error",
          description: "No se pudo eliminar la transacción",
          variant: "destructive"
        });
      }
    }
  };

  const handleAddNew = () => {
    setSelectedTransaction(undefined);
    setIsModalOpen(true);
  };

  const handleOpenDocuments = (transactionId: number) => {
    setSelectedTransactionId(transactionId);
    setIsDocumentsModalOpen(true);
  };

  const handleViewDocuments = (transactionId: number) => {
    setSelectedTransactionId(transactionId);
    setIsViewDocumentsModalOpen(true);
  };

  const handleUpdateDocumentStatus = (transactionId: number) => {
    setTransactions(transactions.map(trans =>
      trans.id === transactionId
        ? { ...trans, documentosPendientes: false }
        : trans
    ));
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-full">Cargando...</div>;
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Transacciones</h2>
          <p className="text-muted-foreground">
            Gestiona las transacciones realizadas en el sistema
          </p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleAddNew}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Transacción
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Transacciones</CardTitle>
          <CardDescription>
            Total de transacciones: {transactions.length}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Buscar transacción por cliente, vehículo, tipo o fecha..."
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
                  <TableHead>Fecha de transacción</TableHead>
                  <TableHead>Nombre del vendedor</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Vehículo</TableHead>
                  <TableHead>Tipo de Transacción</TableHead>
                  <TableHead>Crédito</TableHead>
                  <TableHead>Estado Documentos</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>{new Date(transaction.fecha).toLocaleDateString()}</TableCell>
                    <TableCell>{transaction.usuario?.nombre || 'N/A'}</TableCell>
                    <TableCell>{transaction.clienteNombre}</TableCell>
                    <TableCell>{transaction.vehiculoModelo}</TableCell>
                    <TableCell>{transaction.tipoTransaccionNombre}</TableCell>
                    <TableCell>{transaction.idCredito || 'N/A'}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          transaction.documentosPendientes
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {transaction.documentosPendientes ? 'Pendientes' : 'Completos'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-blue-600 hover:text-blue-700"
                        onClick={() => handleEdit(transaction)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {transaction.documentosPendientes ? (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-blue-600 hover:text-blue-700"
                          onClick={() => handleOpenDocuments(transaction.id)}
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-blue-600 hover:text-blue-700"
                          onClick={() => handleViewDocuments(transaction.id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleDelete(transaction.id)}
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

      <TransactionsModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedTransaction(undefined);
        }}
        onSave={handleSave}
        transaccion={selectedTransaction}
      />

      {selectedTransactionId && (
        <>
          <DocumentsModal
            isOpen={isDocumentsModalOpen}
            onClose={() => {
              setIsDocumentsModalOpen(false);
              setSelectedTransactionId(null);
            }}
            transactionId={selectedTransactionId}
            onUpdateStatus={handleUpdateDocumentStatus}
          />

          <ViewDocumentsModal
            isOpen={isViewDocumentsModalOpen}
            onClose={() => {
              setIsViewDocumentsModalOpen(false);
              setSelectedTransactionId(null);
            }}
            transactionId={selectedTransactionId}
          />
        </>
      )}
    </div>
  );
}