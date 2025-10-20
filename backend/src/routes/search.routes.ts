import { Router } from 'express';
import searchEnhancedController from '../controllers/search-enhanced.controller';

const router = Router();

/**
 * POST /api/search
 * Realiza búsqueda con análisis de IA
 */
router.post('/search', (req, res) => searchEnhancedController.search(req, res));

/**
 * POST /api/reset
 * Reinicia el árbol de búsqueda
 */
router.post('/reset', (req, res) => searchEnhancedController.reset(req, res));

/**
 * GET /api/stats
 * Obtiene estadísticas del árbol
 */
router.get('/stats', (req, res) => searchEnhancedController.getStats(req, res));

/**
 * Rutas de gestión de intereses
 */
router.post('/interests/add', (req, res) => searchEnhancedController.addInterest(req, res));
router.post('/interests/remove', (req, res) => searchEnhancedController.removeInterest(req, res));
router.post('/interests/set', (req, res) => searchEnhancedController.setInterests(req, res));
router.get('/interests', (req, res) => searchEnhancedController.getInterests(req, res));

export default router;
