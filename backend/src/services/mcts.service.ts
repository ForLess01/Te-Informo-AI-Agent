import { SearchNode } from '../models/SearchNode';
import newsAggregator, { NewsArticle } from './news-aggregator.service';
import geminiService from './gemini.service';

/**
 * Servicio MCTS (Monte Carlo Tree Search) para búsqueda guiada
 * Implementa un árbol de búsqueda donde el usuario guía la exploración
 */
export class MCTSService {
  private rootNode: SearchNode | null = null;
  private currentNode: SearchNode | null = null;

  /**
   * Realiza una búsqueda guiada por MCTS
   * @param query - Consulta de búsqueda
   * @param context - Contexto de la conversación (temas previos)
   */
  async search(query: string, context: string[] = []): Promise<{
    results: NewsArticle[];
    suggestions: string[];
    analysis: {
      summary: string;
      keyPoints: string[];
      recommendations: string[];
    };
  }> {
    try {
      console.log(`🌲 MCTS Search - Query: "${query}", Context: [${context.join(', ')}]`);

      // Construir la consulta completa con contexto
      const fullQuery = this.buildQueryWithContext(query, context);

      // Fase de Expansión: Obtener noticias de múltiples fuentes
      const results = await newsAggregator.fetchNews(fullQuery);

      // Análisis con Gemini AI
      const analysis = await geminiService.analyzeNews(results, fullQuery);

      // Crear o actualizar el nodo actual
      if (!this.rootNode) {
        this.rootNode = new SearchNode(query, context);
        this.currentNode = this.rootNode;
      } else {
        // Si hay contexto, crear un nuevo nodo hijo
        const newNode = new SearchNode(query, context, this.currentNode);
        this.currentNode?.addChild(newNode);
        this.currentNode = newNode;
      }

      // Fase de Expansión: Generar sugerencias con IA
      const aiSuggestions = await geminiService.generateSearchSuggestions(query, context);
      const suggestions = aiSuggestions.length > 0 
        ? aiSuggestions 
        : analysis.recommendations;

      // Actualizar estadísticas del nodo (simulación simple)
      this.currentNode.update(results.length > 0 ? 1 : 0);

      console.log(`✅ MCTS generó ${suggestions.length} sugerencias`);

      return {
        results,
        suggestions,
        analysis
      };
    } catch (error) {
      console.error('Error en MCTS search:', error);
      throw error;
    }
  }

  /**
   * Construye la consulta completa combinando query y contexto
   */
  private buildQueryWithContext(query: string, context: string[]): string {
    if (context.length === 0) {
      return query;
    }

    // Combinar el contexto más reciente con la query
    const recentContext = context.slice(-2); // Últimos 2 elementos de contexto
    return `${query} ${recentContext.join(' ')}`;
  }

  /**
   * Genera sugerencias inteligentes basadas en las keywords
   * Filtra y mejora las keywords para hacerlas más útiles
   */
  private generateSuggestions(
    keywords: string[],
    query: string,
    context: string[]
  ): string[] {
    // Filtrar keywords que ya están en el contexto o en la query
    const queryLower = query.toLowerCase();
    const contextLower = context.map(c => c.toLowerCase());

    const filtered = keywords.filter(keyword => {
      const keywordLower = keyword.toLowerCase();
      return !queryLower.includes(keywordLower) && 
             !contextLower.some(ctx => ctx.includes(keywordLower));
    });

    // Si no hay suficientes keywords filtradas, usar algunas originales
    const suggestions = filtered.length >= 3 ? filtered : keywords;

    // Limitar a 5 sugerencias máximo
    return suggestions.slice(0, 5);
  }

  /**
   * Reinicia el árbol de búsqueda (para nueva conversación)
   */
  reset(): void {
    this.rootNode = null;
    this.currentNode = null;
    console.log('🔄 MCTS árbol reiniciado');
  }

  /**
   * Obtiene el nodo actual
   */
  getCurrentNode(): SearchNode | null {
    return this.currentNode;
  }

  /**
   * Obtiene el nodo raíz
   */
  getRootNode(): SearchNode | null {
    return this.rootNode;
  }

  /**
   * Obtiene estadísticas del árbol
   */
  getTreeStats(): {
    totalNodes: number;
    depth: number;
    currentPath: string[];
  } {
    if (!this.rootNode) {
      return { totalNodes: 0, depth: 0, currentPath: [] };
    }

    const totalNodes = this.countNodes(this.rootNode);
    const depth = this.getDepth(this.rootNode);
    const currentPath = this.getCurrentPath();

    return { totalNodes, depth, currentPath };
  }

  /**
   * Cuenta el número total de nodos en el árbol
   */
  private countNodes(node: SearchNode): number {
    let count = 1;
    for (const child of node.children) {
      count += this.countNodes(child);
    }
    return count;
  }

  /**
   * Obtiene la profundidad máxima del árbol
   */
  private getDepth(node: SearchNode): number {
    if (node.isLeaf()) {
      return 1;
    }
    const childDepths = node.children.map(child => this.getDepth(child));
    return 1 + Math.max(...childDepths);
  }

  /**
   * Obtiene el camino desde la raíz hasta el nodo actual
   */
  private getCurrentPath(): string[] {
    const path: string[] = [];
    let node = this.currentNode;

    while (node) {
      path.unshift(node.query);
      node = node.parent;
    }

    return path;
  }
}

export default new MCTSService();
