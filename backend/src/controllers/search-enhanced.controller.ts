import { Request, Response } from 'express';
import mctsEnhanced from '../services/mcts-enhanced.service';
import userInterestsService from '../services/user-interests.service';

/**
 * Controlador mejorado con análisis de IA y gestión de intereses
 */
export class SearchEnhancedController {
  /**
   * POST /api/search
   * Realiza búsqueda con análisis de IA
   */
  async search(req: Request, res: Response): Promise<void> {
    try {
      const { query, context = [], userId = 'default' } = req.body;

      // Validación
      if (!query || typeof query !== 'string') {
        res.status(400).json({
          status: 'error',
          message: 'El campo "query" es requerido y debe ser un string'
        });
        return;
      }

      console.log(`📥 Nueva búsqueda: "${query}" | Usuario: ${userId}`);

      // Realizar búsqueda con análisis de IA
      const result = await mctsEnhanced.search(query, context, userId);

      res.json({
        status: 'success',
        data: {
          results: result.results,
          suggestions: result.suggestions,
          query,
          context,
          analysis: result.analysis,
          userInterests: result.userInterests
        }
      });

      console.log(`📤 Respuesta: ${result.results.length} artículos, ${result.suggestions.length} sugerencias`);
    } catch (error: any) {
      console.error('Error en search:', error);
      res.status(500).json({
        status: 'error',
        message: error.message || 'Error interno del servidor'
      });
    }
  }

  /**
   * POST /api/interests/add
   * Agrega un interés al usuario
   */
  async addInterest(req: Request, res: Response): Promise<void> {
    try {
      const { interest, userId = 'default' } = req.body;

      if (!interest || typeof interest !== 'string') {
        res.status(400).json({
          status: 'error',
          message: 'El campo "interest" es requerido'
        });
        return;
      }

      userInterestsService.addInterest(interest, userId);
      const interests = userInterestsService.getUserInterests(userId);

      res.json({
        status: 'success',
        message: `Interés "${interest}" agregado`,
        data: { interests }
      });
    } catch (error: any) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }

  /**
   * POST /api/interests/remove
   * Elimina un interés del usuario
   */
  async removeInterest(req: Request, res: Response): Promise<void> {
    try {
      const { interest, userId = 'default' } = req.body;

      if (!interest) {
        res.status(400).json({
          status: 'error',
          message: 'El campo "interest" es requerido'
        });
        return;
      }

      userInterestsService.removeInterest(interest, userId);
      const interests = userInterestsService.getUserInterests(userId);

      res.json({
        status: 'success',
        message: `Interés "${interest}" eliminado`,
        data: { interests }
      });
    } catch (error: any) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }

  /**
   * GET /api/interests
   * Obtiene los intereses del usuario
   */
  async getInterests(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.query.userId as string || 'default';
      const interests = userInterestsService.getUserInterests(userId);

      res.json({
        status: 'success',
        data: { interests }
      });
    } catch (error: any) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }

  /**
   * POST /api/interests/set
   * Establece todos los intereses del usuario
   */
  async setInterests(req: Request, res: Response): Promise<void> {
    try {
      const { interests, userId = 'default' } = req.body;

      if (!Array.isArray(interests)) {
        res.status(400).json({
          status: 'error',
          message: 'El campo "interests" debe ser un array'
        });
        return;
      }

      userInterestsService.setInterests(interests, userId);

      res.json({
        status: 'success',
        message: 'Intereses actualizados',
        data: { interests }
      });
    } catch (error: any) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }

  /**
   * POST /api/reset
   * Reinicia el árbol de búsqueda
   */
  async reset(req: Request, res: Response): Promise<void> {
    try {
      mctsEnhanced.reset();
      res.json({
        status: 'success',
        message: 'Árbol MCTS reiniciado'
      });
    } catch (error: any) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }

  /**
   * GET /api/stats
   * Obtiene estadísticas del árbol
   */
  async getStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = mctsEnhanced.getTreeStats();
      res.json({
        status: 'success',
        data: stats
      });
    } catch (error: any) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }
}

export default new SearchEnhancedController();
