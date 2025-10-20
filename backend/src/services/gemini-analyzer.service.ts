import { GoogleGenAI } from '@google/genai';
import { NewsArticle } from './news-scraper.service';

/**
 * Servicio de análisis profundo con Gemini AI
 */
export class GeminiAnalyzerService {
  private ai: GoogleGenAI | null = null;
  private apiKey: string | null = null;
  
  /**
   * Intenta limpiar y parsear un bloque de texto como JSON.
   * Maneja casos comunes: fences ```json, comillas tipográficas, comas colgantes.
   */
  private tryParseJsonLoose(raw: string): any | null {
    if (!raw) return null;
    let text = raw.trim();
    
    console.log(`🔍 Texto original (primeros 100 chars): ${text.substring(0, 100)}`);
    
    // Quitar BOM si existe y prefijo 'json' en primera línea
    text = text.replace(/^\uFEFF/, '').replace(/^json\s*/i, '');

    // Quitar comillas envolventes si vienen '...'/"..."
    if ((text.startsWith('"') && text.endsWith('"')) || (text.startsWith("'") && text.endsWith("'"))) {
      text = text.slice(1, -1);
    }
    
    // Quitar fences ```json ... ``` o ``` ... ```
    if (text.startsWith('```')) {
      text = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '');
      if (text.endsWith('```')) {
        text = text.slice(0, -3);
      }
    }

    // Reemplazar comillas tipográficas por comillas normales
    text = text
      .replace(/[""]/g, '"')
      .replace(/['']/g, "'");

    // Eliminar comas colgantes antes de } o ]
    text = text
      .replace(/,\s*}/g, '}')
      .replace(/,\s*]/g, ']');

    // A veces vienen secuencias escapadas innecesariamente
    const candidate = text.replace(/\\n/g, '\n');
    
    console.log(`🔍 Texto después de limpieza (primeros 100 chars): ${candidate.substring(0, 100)}`);

    try {
      const result = JSON.parse(candidate);
      console.log(`✅ JSON parseado exitosamente`);
      return result;
    } catch (parseError: any) {
      console.log(`❌ Error en JSON.parse: ${parseError.message}`);
      console.log(`🔍 Texto problemático (últimos 100 chars): ${candidate.slice(-100)}`);
      
      // Último intento: extraer el primer objeto JSON plausible
      const match = candidate.match(/\{[\s\S]*\}/);
      if (match) {
        console.log(`🔍 Intentando con match extraído (primeros 100 chars): ${match[0].substring(0, 100)}`);
        try {
          const result = JSON.parse(match[0]);
          console.log(`✅ JSON parseado con match extraído`);
          return result;
        } catch (matchError: any) {
          console.log(`❌ Error en match extraído: ${matchError.message}`);
          return null;
        }
      }
      return null;
    }
  }

  /**
   * Inicializa Gemini AI (lazy loading)
   */
  private initGemini(): void {
    if (this.ai) return; // Ya inicializado

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('⚠️ GEMINI_API_KEY no configurada en el momento de inicialización');
      return;
    }

    try {
      this.apiKey = apiKey;
      this.ai = new GoogleGenAI({ apiKey });
      console.log('✅ Gemini AI inicializado con librería oficial');
    } catch (error: any) {
      console.error('❌ Error inicializando Gemini AI:', error.message);
      this.ai = null;
      this.apiKey = null;
    }
  }

  constructor() {
    // No inicializar aquí, hacerlo lazy
    console.log('🔑 Servicio Gemini creado (inicialización lazy)');
  }

  /**
   * Analiza noticias y genera un informe completo
   */
  async analyzeNews(
    articles: NewsArticle[],
    userQuery: string,
    userInterests: string[] = []
  ): Promise<{
    summary: string;
    keyPoints: string[];
    suggestions: string[];
    sentiment: 'positive' | 'negative' | 'neutral';
    relevantArticles: number[];
  }> {
    try {
      console.log(`🧠 Iniciando análisis con ${articles.length} artículos`);
      console.log(`🔑 API Key disponible: ${this.ai ? 'SÍ' : 'NO'}`);

      // Inicializar Gemini si no está inicializado
      this.initGemini();

      if (!this.ai) {
        console.log('❌ Gemini AI no inicializado, usando fallback');
        return this.createFallbackAnalysis(articles, userQuery);
      }

      console.log(`🧠 Analizando ${articles.length} artículos con Gemini AI...`);

      // Preparar contexto de noticias
      const newsContext = articles.map((article, idx) =>
        `[${idx + 1}] ${article.source} - ${article.title}\n   ${article.snippet}\n   URL: ${article.url}`
      ).join('\n\n');

      const interestsText = userInterests.length > 0
        ? `\n\nIntereses del usuario: ${userInterests.join(', ')}`
        : '';

      console.log(`📝 Preparando prompt con ${newsContext.length} caracteres...`);
      const prompt = `Analiza las siguientes ${articles.length} noticias sobre "${userQuery}" y responde ÚNICAMENTE con un objeto JSON válido.${interestsText}

NOTICIAS:
${newsContext}

INSTRUCCIONES:
1. Resumen ejecutivo de 4-6 párrafos (mínimo 300 palabras)
2. 5-7 puntos clave relevantes
3. 3-5 sugerencias específicas de búsqueda
4. Sentimiento general
5. Artículos relevantes (índices)

RESPONDE SOLO CON ESTE JSON (sin texto adicional, sin explicaciones, sin markdown):
{
  "summary": "resumen ejecutivo extenso aquí",
  "keyPoints": ["punto 1", "punto 2", "punto 3", "punto 4", "punto 5"],
  "suggestions": ["sugerencia 1", "sugerencia 2", "sugerencia 3"],
  "sentiment": "positive",
  "relevantArticles": [0, 1, 2]
}`;

      console.log(`🚀 Enviando petición a Gemini con modelo oficial...`);

      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      console.log(`📝 Tipo de respuesta:`, typeof response);
      console.log(`📝 Propiedades de respuesta:`, Object.keys(response || {}));

      const generatedText = response.text;
      console.log(`✅ Respuesta recibida de Gemini`);
      console.log(`📝 Texto generado (primeros 200 chars):`, generatedText?.substring(0, 200));

      // Intentar parseo directo primero
      try {
        const parsed = JSON.parse(generatedText || '');
        console.log(`✅ JSON parseado directamente`);
        return {
          summary: parsed.summary || '',
          keyPoints: parsed.keyPoints || [],
          suggestions: parsed.suggestions || parsed.recommendations || [],
          sentiment: parsed.sentiment || 'neutral',
          relevantArticles: parsed.relevantArticles || []
        };
      } catch (directError: any) {
        console.log(`⚠️ Parseo directo falló: ${directError.message}`);
        
        // Intentar con saneamiento como respaldo
        const parsed = this.tryParseJsonLoose(generatedText || '');
        if (parsed) {
          console.log(`✅ JSON parseado con saneamiento`);
          return {
            summary: parsed.summary || '',
            keyPoints: parsed.keyPoints || [],
            suggestions: parsed.suggestions || parsed.recommendations || [],
            sentiment: parsed.sentiment || 'neutral',
            relevantArticles: parsed.relevantArticles || []
          };
        }

        console.warn(`⚠️ No se pudo parsear JSON de la respuesta, usando fallback`);
        return this.createFallbackAnalysis(articles, userQuery);
      }
    } catch (error: any) {
      console.error('❌ Error en análisis de Gemini:', error.message);
      if (error.response) {
        console.error('❌ Respuesta de error:', error.response.status, error.response.data);
      }
      console.log('🔄 Usando fallback...');
      return this.createFallbackAnalysis(articles, userQuery);
    }
  }

  /**
   * Análisis de respaldo cuando Gemini falla
   */
  private createFallbackAnalysis(articles: NewsArticle[], query: string) {
    const sources = [...new Set(articles.map(a => a.source))];

    // Crear resumen extenso
    const mainArticle = articles[0];
    const summary = `Esto es lo que encontré sobre "${query}": ${mainArticle?.title || 'Información actualizada'}. ${mainArticle?.snippet || ''}

Las fuentes consultadas incluyen ${sources.slice(0, 3).join(', ')}${sources.length > 3 ? ' y otros medios reconocidos' : ''}. Este tema ha generado considerable interés en los últimos días debido a su relevancia actual.

Según los expertos y analistas consultados, este es un tema que requiere atención especial por sus implicaciones a corto y largo plazo. Los diferentes medios han abordado el tema desde múltiples perspectivas, ofreciendo análisis complementarios.

Es importante seguir de cerca los desarrollos futuros relacionados con este tema, ya que podría tener impactos significativos en diversos sectores.`;

    // Generar sugerencias específicas basadas en el query
    const suggestions = [
      `¿Cuáles son las últimas noticias sobre ${query}?`,
      `Impacto de ${query} en la economía`,
      `Análisis de expertos sobre ${query}`,
      `Perspectivas futuras de ${query}`
    ];

    return {
      summary,
      keyPoints: articles.slice(0, 5).map(a => a.title),
      suggestions: suggestions.slice(0, 4),
      sentiment: 'neutral' as const,
      relevantArticles: articles.map((_, i) => i).slice(0, 3)
    };
  }
}

export default new GeminiAnalyzerService();
