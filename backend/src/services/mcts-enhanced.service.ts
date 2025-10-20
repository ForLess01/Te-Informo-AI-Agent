import { SearchNode } from '../models/SearchNode';
import newsScraper, { NewsArticle } from './news-scraper.service';
import geminiAnalyzer from './gemini-analyzer.service';
import userInterestsService from './user-interests.service';

/**
 * Servicio MCTS mejorado con análisis profundo de IA
 */
export class MCTSEnhancedService {
  private rootNode: SearchNode | null = null;
  private currentNode: SearchNode | null = null;

  /**
   * Realiza búsqueda inteligente con análisis de IA
   */
  async search(query: string, context: string[] = [], userId: string = 'default'): Promise<{
    results: NewsArticle[];
    suggestions: string[];
    analysis: {
      summary: string;
      keyPoints: string[];
      suggestions: string[];
      sentiment: string;
      commentary?: string;
    };
    userInterests: string[];
  }> {
    try {
      console.log(`🌲 MCTS Enhanced - Query: "${query}", Context: [${context.join(', ')}]`);

      // Obtener intereses del usuario
      const userInterests = userInterestsService.getUserInterests(userId);
      console.log(`👤 Intereses del usuario: [${userInterests.join(', ')}]`);

      // Construir consulta con contexto
      const fullQuery = this.buildQueryWithContext(query, context);

      // PASO 1: Buscar noticias en periódicos reales
      console.log('📰 Paso 1: Scraping de periódicos...');
      const results = await newsScraper.searchNews(fullQuery, userInterests);
      console.log(`✅ Encontrados ${results.length} artículos de múltiples fuentes`);

      // PASO 2: Análisis profundo con Gemini AI
      console.log('🧠 Paso 2: Análisis con IA...');
      const aiAnalysis = await geminiAnalyzer.analyzeNews(results, fullQuery, userInterests);

      // Las sugerencias ahora vienen directamente del análisis de Gemini
      const suggestions = aiAnalysis.suggestions;

      // Actualizar árbol MCTS
      if (!this.rootNode) {
        this.rootNode = new SearchNode(query, context);
        this.currentNode = this.rootNode;
      } else {
        const newNode = new SearchNode(query, context, this.currentNode);
        this.currentNode?.addChild(newNode);
        this.currentNode = newNode;
      }

      this.currentNode.update(results.length > 0 ? 1 : 0);

      console.log(`✅ Análisis completado: ${aiAnalysis.keyPoints.length} puntos clave, ${suggestions.length} sugerencias`);

      return {
        results,
        suggestions,
        analysis: {
          summary: aiAnalysis.summary,
          keyPoints: aiAnalysis.keyPoints,
          suggestions: aiAnalysis.suggestions,
          sentiment: aiAnalysis.sentiment
        },
        userInterests
      };
    } catch (error) {
      console.error('Error en MCTS Enhanced:', error);
      throw error;
    }
  }

  /**
   * Construye la consulta completa con contexto
   */
  private buildQueryWithContext(query: string, context: string[]): string {
    if (context.length === 0) {
      return query;
    }
    const recentContext = context.slice(-2);
    return `${query} ${recentContext.join(' ')}`;
  }

  /**
   * Reinicia el árbol de búsqueda
   */
  reset(): void {
    this.rootNode = null;
    this.currentNode = null;
    console.log('🔄 MCTS árbol reiniciado');
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

  private countNodes(node: SearchNode): number {
    let count = 1;
    for (const child of node.children) {
      count += this.countNodes(child);
    }
    return count;
  }

  private getDepth(node: SearchNode): number {
    if (node.isLeaf()) {
      return 1;
    }
    const childDepths = node.children.map(child => this.getDepth(child));
    return 1 + Math.max(...childDepths);
  }

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

export default new MCTSEnhancedService();
