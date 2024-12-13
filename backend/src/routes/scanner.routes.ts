import { Router, Request, Response, NextFunction } from 'express';
import { verificarToken, verificarRol } from '../middlewares/auth.middleware';
import ScannerController from '../controllers/scanner.controller';
import { RolUsuario } from '../types';

const router = Router();
const scannerController = ScannerController.getInstance();

// Middleware de autenticación y rol
const autenticarYVerificarRol = (req: Request, res: Response, next: NextFunction) => {
    verificarToken(req, res, () => {
        verificarRol([RolUsuario.Administrador, RolUsuario.Ventas])(req, res, next);
    });
};

// Middleware solo para admin
const verificarAdmin = (req: Request, res: Response, next: NextFunction) => {
    verificarToken(req, res, () => {
        verificarRol([RolUsuario.Administrador])(req, res, next);
    });
};

// Rutas protegidas
router.get('/status', autenticarYVerificarRol, scannerController.getStatus.bind(scannerController));
router.post('/scan', autenticarYVerificarRol, scannerController.startScan.bind(scannerController));
router.post('/configure', verificarAdmin, scannerController.configure.bind(scannerController));
router.get('/test-connection', autenticarYVerificarRol, scannerController.testConnection.bind(scannerController));

export default router;