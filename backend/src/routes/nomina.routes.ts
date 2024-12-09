import { Router, Request, Response, NextFunction } from 'express';
import { verificarToken, verificarRol } from '../middlewares/auth.middleware';
import { RolUsuario } from '../types';

const router = Router();

// Middleware de autenticación y rol para RRHH y Admin
const autenticarYVerificarRolNomina = (req: Request, res: Response, next: NextFunction) => {
    verificarToken(req, res, () => {
        verificarRol([RolUsuario.Administrador, RolUsuario.RRHH])(req, res, next);
    });
};

// Middleware solo para admin
const verificarAdmin = (req: Request, res: Response, next: NextFunction) => {
    verificarToken(req, res, () => {
        verificarRol([RolUsuario.Administrador])(req, res, next);
    });
};

// Rutas protegidas
// Obtener todas las nóminas
router.get('/list', autenticarYVerificarRolNomina, (req: Request, res: Response) => {
    res.json({ message: 'Lista de nóminas' });
});

// Obtener una nómina por ID
router.get('/:id', autenticarYVerificarRolNomina, (req: Request, res: Response) => {
    const { id } = req.params;
    res.json({ message: `Obtener nómina por ID: ${id}` });
});

// Crear una nueva nómina
router.post('/', autenticarYVerificarRolNomina, (req: Request, res: Response) => {
    const nominaData = req.body;
    res.json({ message: 'Crear nómina', data: nominaData });
});

// Actualizar una nómina (solo admin)
router.put('/:id', verificarAdmin, (req: Request, res: Response) => {
    const { id } = req.params;
    const nominaData = req.body;
    res.json({ message: `Actualizar nómina: ${id}`, data: nominaData });
});

// Registrar pago de nómina
router.post('/:id/pago', autenticarYVerificarRolNomina, (req: Request, res: Response) => {
    const { id } = req.params;
    const pagoData = req.body;
    res.json({ message: `Registrar pago de nómina: ${id}`, data: pagoData });
});

// Registrar comisiones
router.post('/:id/comisiones', autenticarYVerificarRolNomina, (req: Request, res: Response) => {
    const { id } = req.params;
    const comisionesData = req.body;
    res.json({ message: `Registrar comisiones para nómina: ${id}`, data: comisionesData });
});

// Obtener nóminas por empleado
router.get('/empleado/:empleadoId', autenticarYVerificarRolNomina, (req: Request, res: Response) => {
    const { empleadoId } = req.params;
    res.json({ message: `Obtener nóminas del empleado: ${empleadoId}` });
});

// Obtener nóminas por período
router.get('/periodo/:inicio/:fin', autenticarYVerificarRolNomina, (req: Request, res: Response) => {
    const { inicio, fin } = req.params;
    res.json({ message: `Obtener nóminas del período: ${inicio} al ${fin}` });
});

// Generar reporte de nómina
router.post('/reporte', autenticarYVerificarRolNomina, (req: Request, res: Response) => {
    const filtros = req.body;
    res.json({ message: 'Generar reporte de nóminas', filtros });
});

// Calcular deducciones
router.post('/:id/deducciones', autenticarYVerificarRolNomina, (req: Request, res: Response) => {
    const { id } = req.params;
    const deduccionesData = req.body;
    res.json({ message: `Calcular deducciones para nómina: ${id}`, data: deduccionesData });
});

// Aprobar nómina (solo admin)
router.post('/:id/aprobar', verificarAdmin, (req: Request, res: Response) => {
    const { id } = req.params;
    res.json({ message: `Aprobar nómina: ${id}` });
});

export default router;