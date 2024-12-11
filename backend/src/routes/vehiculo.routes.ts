import { Router } from 'express';
import { VehiculoController } from '../controllers/vehiculo.controller';

const router = Router();
const controller = new VehiculoController();

// GET all vehiculos
router.get('/', controller.getAll.bind(controller));

// GET vehiculo by ID
router.get('/:id', controller.getById.bind(controller));

// GET vehiculo by filters (num_serie, placas, num_motor)
router.get('/search/filters', async (req, res) => {
    const { numSerie, placas, numMotor } = req.query;

    try {
        if (numSerie) {
            await controller.getByNumSerie(req, res);
            return;
        }
        
        if (placas) {
            await controller.getByPlacas(req, res);
            return;
        }
        
        if (numMotor) {
            await controller.getByNumMotor(req, res);
            return;
        }

        res.status(400).json({
            success: false,
            message: 'Se debe proporcionar al menos un criterio de búsqueda (numSerie, placas o numMotor)'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al buscar vehículos',
            error: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
});

// POST create new vehiculo
router.post('/', controller.create.bind(controller));

// PUT update vehiculo
router.put('/:id', controller.update.bind(controller));

// DELETE vehiculo
router.delete('/:id', controller.delete.bind(controller));

export default router;