import { useState, ChangeEvent } from 'react';
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
import { Search, Plus, Trash2, FileText, Eye } from 'lucide-react';
import { TransactionsModal } from '@/components/modals/TransactionsModal';
import { DocumentsModal } from '@/components/modals/DocumentsModal';
import { ViewDocumentsModal } from '@/components/modals/ViewDocumentsModal';

interface Transaction {
  id_transaccion: number;
  fecha: string;
  id_usuario: number;
  nombre: string,
  id_cliente: number;
  id_vehiculo: number;
  id_credito?: number | null;
  id_tipo_transaccion: number;
  cliente_nombre: string;
  vehiculo_modelo: string;
  tipo_transaccion_nombre: string;
  documentos_pendientes: boolean;
}

const transactionsMock: Transaction[] = [
  {
    id_transaccion: 1,
    fecha: '2024-04-15',
    id_usuario: 1,
    id_cliente: 1,
    nombre: 'Juan Pérez',
    id_vehiculo: 5,
    id_credito: null,
    id_tipo_transaccion: 1,
    cliente_nombre: 'Ana López',
    vehiculo_modelo: 'Toyota Corolla 2022',
    tipo_transaccion_nombre: 'Venta',
    documentos_pendientes: true
  },
  {
    id_transaccion: 2,
    fecha: '2024-04-16',
    id_usuario: 2,
    nombre: 'Anatolia',     // Nombre del empleado/vendedor
    id_cliente: 2,
    id_vehiculo: 7,
    id_credito: 3,
    id_tipo_transaccion: 2,
    cliente_nombre: 'Carlos Ruiz',
    vehiculo_modelo: 'Honda Civic 2023',
    tipo_transaccion_nombre: 'Crédito',
    documentos_pendientes: false
  }
];

export default function TransactionsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [transactions, setTransactions] = useState<Transaction[]>(transactionsMock);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDocumentsModalOpen, setIsDocumentsModalOpen] = useState(false);
  const [isViewDocumentsModalOpen, setIsViewDocumentsModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | undefined>(undefined);
  const [selectedTransactionId, setSelectedTransactionId] = useState<number | null>(null);

  const filteredTransactions = transactions.filter(transaction =>
    transaction.cliente_nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.vehiculo_modelo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.tipo_transaccion_nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.fecha.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSave = (transactionData: Omit<Transaction, 'id_transaccion' | 'documentos_pendientes'>) => {
    if (selectedTransaction) {
      // Edit existing transaction
      setTransactions(transactions.map(trans =>
        trans.id_transaccion === selectedTransaction.id_transaccion
          ? { ...transactionData, id_transaccion: selectedTransaction.id_transaccion, documentos_pendientes: trans.documentos_pendientes }
          : trans
      ));
    } else {
      // Create new transaction
      const newTransaction = {
        ...transactionData,
        id_transaccion: Math.max(...transactions.map(t => t.id_transaccion)) + 1,
        documentos_pendientes: true
      };
      setTransactions([...transactions, newTransaction]);
    }
    setIsModalOpen(false);
    setSelectedTransaction(undefined);
  };

  const handleEdit = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsModalOpen(true);
  };

  const handleDelete = (transactionId: number) => {
    if (confirm('¿Está seguro que desea eliminar esta transacción?')) {
      setTransactions(transactions.filter(trans => trans.id_transaccion !== transactionId));
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
      trans.id_transaccion === transactionId
        ? { ...trans, documentos_pendientes: false }
        : trans
    ));
  };

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
                  <TableRow key={transaction.id_transaccion}>
                    <TableCell>{new Date(transaction.fecha).toLocaleDateString()}</TableCell>
                    <TableCell>{transaction.nombre}</TableCell>

                    <TableCell>{transaction.cliente_nombre}</TableCell>
                    <TableCell>{transaction.vehiculo_modelo}</TableCell>
                    <TableCell>{transaction.tipo_transaccion_nombre}</TableCell>
                    <TableCell>{transaction.id_credito || 'N/A'}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${transaction.documentos_pendientes
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                          }`}
                      >
                        {transaction.documentos_pendientes ? 'Pendientes' : 'Completos'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      {transaction.documentos_pendientes ? (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-blue-600 hover:text-blue-700"
                          onClick={() => handleOpenDocuments(transaction.id_transaccion)}
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-blue-600 hover:text-blue-700"
                          onClick={() => handleViewDocuments(transaction.id_transaccion)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleDelete(transaction.id_transaccion)}
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
        transaction={selectedTransaction}
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