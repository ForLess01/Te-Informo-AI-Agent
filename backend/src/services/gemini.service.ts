import axios from 'axios';

/**
 * Servicio de Gemini AI para análisis y resumen de noticias
 */
export class GeminiService {
  private apiKey: string;
  private apiUrl: string = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || '';
    if (!this.apiKey) {
      console.warn('⚠️ GEMINI_API_KEY no configurada');
    }
  }

  /**
   * Analiza y resume noticias usando Gemini AI
   */
  async analyzeNews(newsArticles: any[], userQuery: string): Promise<{
    summary: string;
    keyPoints: string[];
    recommendations: string[];
  }> {
    try {
      // Preparar el contexto de noticias
      const newsContext = newsArticles.map((article, idx) => 
        `${idx + 1}. ${article.title}\n   ${article.snippet}\n   Fuente: ${article.source}`
      ).join('\n\n');

      const prompt = `Eres un asistente de noticias inteligente. Analiza las siguientes noticias sobre "${userQuery}" y proporciona:

1. Un resumen conciso y claro (2-3 párrafos)
2. Los 5 puntos clave más importantes
3. 3 temas relacionados que podrían interesar al usuario

NOTICIAS:
${newsContext}

Responde en formato JSON:
{
  "summary": "resumen aquí",
  "keyPoints": ["punto 1", "punto 2", ...],
  "recommendations": ["tema 1", "tema 2", "tema 3"]
}`;

      const response = await axios.post(
        `${this.apiUrl}?key=${this.apiKey}`,
        {
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        },
        {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );

      // Extraer la respuesta
      const generatedText = response.data.candidates[0].content.parts[0].text;
      
      // Intentar parsear como JSON
      const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          summary: parsed.summary || 'No se pudo generar resumen',
          keyPoints: parsed.keyPoints || [],
          recommendations: parsed.recommendations || []
        };
      }

      // Fallback si no es JSON válido
      return {
        summary: generatedText,
        keyPoints: [],
        recommendations: []
      };
    } catch (error: any) {
      console.error('Error en Gemini AI:', error.message);
      
      // Fallback sin IA
      return {
        summary: `Encontré ${newsArticles.length} noticias sobre "${userQuery}". Explora los artículos para más detalles.`,
        keyPoints: newsArticles.slice(0, 5).map(a => a.title),
        recommendations: ['Tecnología', 'Economía', 'Ciencia']
      };
    }
  }

  /**
   * Genera sugerencias de búsqueda basadas en el contexto
   */
  async generateSearchSuggestions(query: string, context: string[]): Promise<string[]> {
    try {
      const prompt = `Basándote en la consulta "${query}" y el contexto de conversación [${context.join(', ')}], sugiere 5 temas relacionados específicos que el usuario podría querer explorar. Responde solo con una lista separada por comas.`;

      const response = await axios.post(
        `${this.apiUrl}?key=${this.apiKey}`,
        {
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        },
        {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      );

      const generatedText = response.data.candidates[0].content.parts[0].text;
      const suggestions = generatedText.split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0);
      
      return suggestions.slice(0, 5);
    } catch (error) {
      console.error('Error generando sugerencias:', error);
      return [];
    }
  }
}

export default new GeminiService();
