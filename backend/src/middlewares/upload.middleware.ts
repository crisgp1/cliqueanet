import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';

// Asegurarse de que los directorios existan y tengan los permisos correctos
const createDirectoryWithPermissions = (dirPath: string) => {
  if (!fs.existsSync(dirPath)) {
    // Crear el directorio con permisos 0755 (rwxr-xr-x)
    fs.mkdirSync(dirPath, { recursive: true, mode: 0o755 });
  } else {
    // Asegurar que los permisos sean correctos incluso si el directorio ya existe
    fs.chmodSync(dirPath, 0o755);
  }
};

// Configurar directorios
const uploadDir = path.join(process.cwd(), 'uploads');
const documentosDir = path.join(uploadDir, 'documentos');
const tempDir = path.join(uploadDir, 'temp');

// Crear directorios necesarios
[uploadDir, documentosDir, tempDir].forEach(createDirectoryWithPermissions);

// Configuración de almacenamiento
const storage = multer.diskStorage({
  destination: (_req: Request, _file: Express.Multer.File, cb) => {
    // Usar el directorio temporal primero
    cb(null, tempDir);
  },
  filename: (_req: Request, file: Express.Multer.File, cb) => {
    // Generar nombre único
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    const filename = `${uniqueSuffix}${extension}`;
    cb(null, filename);
  }
});

// Filtro de archivos
const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png',
    'application/xml'
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de archivo no permitido. Solo se permiten PDF, DOC, DOCX, JPG, PNG y XML.'));
  }
};

// Configuración de multer
export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 5 // máximo 5 archivos a la vez
  },
  fileFilter: fileFilter
});

// Función para mover archivo del directorio temporal al final
export const moveFileToFinal = (tempPath: string, filename: string): string => {
  const finalPath = path.join(documentosDir, filename);
  fs.renameSync(tempPath, finalPath);
  return `/uploads/documentos/${filename}`;
};

// Función para limpiar archivos temporales antiguos
export const cleanupTempFiles = () => {
  const files = fs.readdirSync(tempDir);
  const now = Date.now();
  const oneHourAgo = now - (60 * 60 * 1000); // 1 hora

  files.forEach(file => {
    const filePath = path.join(tempDir, file);
    const stats = fs.statSync(filePath);
    if (stats.mtimeMs < oneHourAgo) {
      fs.unlinkSync(filePath);
    }
  });
};

// Limpiar archivos temporales cada hora
setInterval(cleanupTempFiles, 60 * 60 * 1000);