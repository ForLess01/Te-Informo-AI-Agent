import { Request, Response } from 'express';
import mctsService from '../services/mcts.service';
import { SearchResponse } from '../models/SearchNode';

/**
 * Controlador para las operaciones de búsqueda
 */
export class SearchController {
  /**
   * POST /api/search
   * Realiza una búsqueda guiada por MCTS
   */
  async search(req: Request, res: Response): Promise<void> {
    try {
      const { query, context = [] } = req.body;

      // Validación
      if (!query || typeof query !== 'string') {
        res.status(400).json({
          status: 'error',
          message: 'El campo "query" es requerido y debe ser un string'
        } as SearchResponse);
        return;
      }

      if (!Array.isArray(context)) {
        res.status(400).json({
          status: 'error',
          message: 'El campo "context" debe ser un array'
        } as SearchResponse);
        return;
      }

      console.log(`📥 Nueva búsqueda: "${query}" con contexto: [${context.join(', ')}]`);

      // Realizar búsqueda con MCTS y análisis de IA
      const { results, suggestions, analysis } = await mctsService.search(query, context);

      // Responder
      const response: SearchResponse = {
        status: 'success',
        data: {
          results,
          suggestions,
          query,
          context,
          analysis
        }
      };

      console.log(`📤 Respuesta enviada: ${results.length} resultados, ${suggestions.length} sugerencias`);
      res.json(response);
    } catch (error: any) {
      console.error('Error en search controller:', error);
      res.status(500).json({
        status: 'error',
        message: error.message || 'Error interno del servidor'
      } as SearchResponse);
    }
  }

  /**
   * POST /api/reset
   * Reinicia el árbol de búsqueda MCTS
   */
  async reset(req: Request, res: Response): Promise<void> {
    try {
      mctsService.reset();
      res.json({
        status: 'success',
        message: 'Árbol MCTS reiniciado correctamente'
      });
    } catch (error: any) {
      console.error('Error en reset controller:', error);
      res.status(500).json({
        status: 'error',
        message: error.message || 'Error al reiniciar'
      });
    }
  }

  /**
   * GET /api/stats
   * Obtiene estadísticas del árbol MCTS
   */
  async getStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = mctsService.getTreeStats();
      res.json({
        status: 'success',
        data: stats
      });
    } catch (error: any) {
      console.error('Error en stats controller:', error);
      res.status(500).json({
        status: 'error',
        message: error.message || 'Error al obtener estadísticas'
      });
    }
  }
}

export default new SearchController();
