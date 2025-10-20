/**
 * Clase que representa un nodo en el árbol de búsqueda MCTS
 * Cada nodo representa un estado de la conversación
 */
export class SearchNode {
  query: string;
  context: string[];
  parent: SearchNode | null;
  children: SearchNode[];
  visits: number;
  score: number;

  constructor(
    query: string,
    context: string[] = [],
    parent: SearchNode | null = null
  ) {
    this.query = query;
    this.context = context;
    this.parent = parent;
    this.children = [];
    this.visits = 0;
    this.score = 0;
  }

  /**
   * Añade un nodo hijo
   */
  addChild(child: SearchNode): void {
    this.children.push(child);
  }

  /**
   * Actualiza las estadísticas del nodo
   */
  update(reward: number): void {
    this.visits++;
    this.score += reward;
  }

  /**
   * Obtiene el valor promedio del nodo
   */
  getAverageScore(): number {
    return this.visits > 0 ? this.score / this.visits : 0;
  }

  /**
   * Verifica si el nodo es una hoja
   */
  isLeaf(): boolean {
    return this.children.length === 0;
  }
}

/**
 * Interfaz para los resultados de búsqueda
 */
export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  source?: string;
  imageUrl?: string;
  publishedDate?: string;
  type?: 'article' | 'video';
}

/**
 * Interfaz para la respuesta de la API
 */
export interface SearchResponse {
  status: 'success' | 'error';
  data?: {
    results: SearchResult[];
    suggestions: string[];
    query: string;
    context: string[];
    analysis?: {
      summary: string;
      keyPoints: string[];
      recommendations: string[];
    };
  };
  message?: string;
}
