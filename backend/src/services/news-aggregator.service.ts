import axios from 'axios';
import * as cheerio from 'cheerio';

export interface NewsArticle {
  title: string;
  url: string;
  snippet: string;
  source: string;
  imageUrl?: string;
  publishedDate?: string;
  type: 'article' | 'video';
}

/**
 * Servicio agregador de noticias de múltiples fuentes
 */
export class NewsAggregatorService {
  private readonly timeout: number = 8000;
  private readonly userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

  /**
   * Obtiene noticias de múltiples fuentes
   */
  async fetchNews(query: string): Promise<NewsArticle[]> {
    const results: NewsArticle[] = [];

    try {
      // Ejecutar búsquedas en paralelo
      const [googleNews, youtubeVideos] = await Promise.allSettled([
        this.scrapeGoogleNews(query),
        this.scrapeYouTube(query)
      ]);

      // Agregar resultados de Google News
      if (googleNews.status === 'fulfilled') {
        results.push(...googleNews.value);
      }

      // Agregar videos de YouTube
      if (youtubeVideos.status === 'fulfilled') {
        results.push(...youtubeVideos.value);
      }

      console.log(`✅ Agregadas ${results.length} noticias de múltiples fuentes`);
      return results;
    } catch (error) {
      console.error('Error agregando noticias:', error);
      return this.getFallbackNews(query);
    }
  }

  /**
   * Scraping de Google News
   */
  private async scrapeGoogleNews(query: string): Promise<NewsArticle[]> {
    try {
      const encodedQuery = encodeURIComponent(query);
      const url = `https://news.google.com/search?q=${encodedQuery}&hl=es&gl=MX&ceid=MX:es`;
      
      const response = await axios.get(url, {
        timeout: this.timeout,
        headers: { 'User-Agent': this.userAgent }
      });

      const $ = cheerio.load(response.data);
      const articles: NewsArticle[] = [];

      $('article').each((index, element) => {
        if (index >= 8) return false; // Limitar a 8 artículos

        const $article = $(element);
        const title = $article.find('h3, h4').first().text().trim();
        const link = $article.find('a').first().attr('href');
        const snippet = $article.find('p').first().text().trim() || title;
        const source = $article.find('time').parent().text().trim() || 'Google News';
        const imageUrl = $article.find('img').first().attr('src');

        if (title && link) {
          const fullUrl = link.startsWith('http') 
            ? link 
            : `https://news.google.com${link}`;

          articles.push({
            title,
            url: fullUrl,
            snippet: snippet.substring(0, 200),
            source,
            imageUrl,
            type: 'article'
          });
        }
      });

      return articles;
    } catch (error) {
      console.error('Error scraping Google News:', error);
      return [];
    }
  }

  /**
   * Scraping de YouTube (búsqueda de videos)
   */
  private async scrapeYouTube(query: string): Promise<NewsArticle[]> {
    try {
      const encodedQuery = encodeURIComponent(query + ' noticias');
      const url = `https://www.youtube.com/results?search_query=${encodedQuery}`;
      
      const response = await axios.get(url, {
        timeout: this.timeout,
        headers: { 'User-Agent': this.userAgent }
      });

      // Extraer datos de ytInitialData
      const ytInitialDataMatch = response.data.match(/var ytInitialData = ({.*?});/);
      if (!ytInitialDataMatch) {
        return [];
      }

      const ytData = JSON.parse(ytInitialDataMatch[1]);
      const videos: NewsArticle[] = [];

      // Navegar por la estructura de datos de YouTube
      const contents = ytData?.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents || [];
      
      for (const section of contents) {
        const items = section?.itemSectionRenderer?.contents || [];
        
        for (const item of items) {
          if (videos.length >= 5) break; // Limitar a 5 videos

          const videoRenderer = item?.videoRenderer;
          if (!videoRenderer) continue;

          const videoId = videoRenderer.videoId;
          const title = videoRenderer.title?.runs?.[0]?.text || '';
          const channelName = videoRenderer.ownerText?.runs?.[0]?.text || '';
          const thumbnail = videoRenderer.thumbnail?.thumbnails?.[0]?.url || '';
          const description = videoRenderer.descriptionSnippet?.runs?.map((r: any) => r.text).join('') || '';

          if (videoId && title) {
            videos.push({
              title,
              url: `https://www.youtube.com/watch?v=${videoId}`,
              snippet: description.substring(0, 200),
              source: `YouTube - ${channelName}`,
              imageUrl: thumbnail,
              type: 'video'
            });
          }
        }
      }

      return videos;
    } catch (error) {
      console.error('Error scraping YouTube:', error);
      return [];
    }
  }

  /**
   * Noticias de respaldo cuando falla el scraping
   */
  private getFallbackNews(query: string): NewsArticle[] {
    return [
      {
        title: `Últimas noticias sobre ${query}`,
        url: `https://www.google.com/search?q=${encodeURIComponent(query)}&tbm=nws`,
        snippet: `Información actualizada sobre ${query}. Haz clic para ver más detalles.`,
        source: 'Búsqueda Google',
        type: 'article'
      },
      {
        title: `${query}: Videos y análisis`,
        url: `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`,
        snippet: `Videos y contenido multimedia sobre ${query}.`,
        source: 'YouTube',
        type: 'video'
      }
    ];
  }
}

export default new NewsAggregatorService();
