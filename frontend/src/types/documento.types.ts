// Estados de documento
export type DocumentoEstado = 'pendiente' | 'aprobado' | 'rechazado';

// Tipos de documento
export type TipoDocumento = 
  'Identificación' | 
  'Comprobante de Domicilio' | 
  'Factura' | 
  'Contrato' | 
  'Carta Responsiva' | 
  'Poder Notarial' |
  'Acta Constitutiva' |
  'RFC' |
  'CURP' |
  'Comprobante de Ingresos' |
  'Estado de Cuenta' |
  'Otro';

// Permisos de acceso
export type PermisosAcceso = 'público' | 'privado' | 'restringido';

// Extensiones permitidas
export type ExtensionArchivo = '.pdf' | '.jpg' | '.png' | '.xml';

// Tipo para la configuración de validación
export type ValidacionDocumento = {
  extensionesPermitidas: ExtensionArchivo[];
  tamañoMaximoMB: number;
  vigenciaRequerida?: boolean;
  antiguedadMaximaMeses?: number;
  requiereVerificacion?: boolean;
  requiereFirma?: boolean;
};

// Configuración de validación por tipo de documento
export const VALIDACION_DOCUMENTOS: Record<TipoDocumento, ValidacionDocumento> = {
  'Identificación': {
    extensionesPermitidas: ['.pdf', '.jpg', '.png'],
    tamañoMaximoMB: 5,
    vigenciaRequerida: true,
    antiguedadMaximaMeses: 60,
    requiereVerificacion: true
  },
  'Comprobante de Domicilio': {
    extensionesPermitidas: ['.pdf', '.jpg', '.png'],
    tamañoMaximoMB: 5,
    vigenciaRequerida: true,
    antiguedadMaximaMeses: 3
  },
  'Factura': {
    extensionesPermitidas: ['.pdf', '.xml'],
    tamañoMaximoMB: 10,
    requiereVerificacion: true
  },
  'Contrato': {
    extensionesPermitidas: ['.pdf'],
    tamañoMaximoMB: 10,
    requiereFirma: true
  },
  'Carta Responsiva': {
    extensionesPermitidas: ['.pdf'],
    tamañoMaximoMB: 5,
    requiereFirma: true
  },
  'Poder Notarial': {
    extensionesPermitidas: ['.pdf'],
    tamañoMaximoMB: 10,
    requiereVerificacion: true
  },
  'Acta Constitutiva': {
    extensionesPermitidas: ['.pdf'],
    tamañoMaximoMB: 10,
    requiereVerificacion: true
  },
  'RFC': {
    extensionesPermitidas: ['.pdf'],
    tamañoMaximoMB: 5,
    requiereVerificacion: true
  },
  'CURP': {
    extensionesPermitidas: ['.pdf'],
    tamañoMaximoMB: 2,
    requiereVerificacion: true
  },
  'Comprobante de Ingresos': {
    extensionesPermitidas: ['.pdf'],
    tamañoMaximoMB: 5,
    vigenciaRequerida: true,
    antiguedadMaximaMeses: 3
  },
  'Estado de Cuenta': {
    extensionesPermitidas: ['.pdf'],
    tamañoMaximoMB: 10,
    vigenciaRequerida: true,
    antiguedadMaximaMeses: 3
  },
  'Otro': {
    extensionesPermitidas: ['.pdf', '.jpg', '.png'],
    tamañoMaximoMB: 10
  }
};