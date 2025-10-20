import axios from 'axios';
import * as cheerio from 'cheerio';
import screenshotService from './screenshot.service';

export interface NewsArticle {
  title: string;
  url: string;
  snippet: string;
  source: string;
  imageUrl?: string;
  publishedDate?: string;
  type: 'article' | 'video';
  fullContent?: string;
}

/**
 * Servicio de scraping de periódicos y fuentes de noticias reales
 */
export class NewsScraperService {
  private readonly timeout: number = 10000;
  private readonly userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

  /**
   * Busca noticias en múltiples periódicos internacionales
   */
  async searchNews(query: string, userInterests: string[] = []): Promise<NewsArticle[]> {
    console.log(`📰 Buscando noticias sobre "${query}" en periódicos internacionales...`);
    
    const results: NewsArticle[] = [];

    try {
      // Buscar en paralelo en múltiples fuentes
      const searches = await Promise.allSettled([
        this.searchGoogleNews(query),
        this.searchBBC(query),
        this.searchCNN(query),
        this.searchElPais(query),
        this.searchYouTube(query)
      ]);

      // Agregar todos los resultados exitosos
      searches.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          results.push(...result.value);
          console.log(`✅ Fuente ${index + 1}: ${result.value.length} artículos`);
        } else {
          console.log(`❌ Fuente ${index + 1}: Error - ${result.reason?.message}`);
        }
      });

      // Filtrar por intereses del usuario si existen
      let filteredResults = results;
      if (userInterests.length > 0) {
        filteredResults = this.filterByInterests(results, userInterests);
        console.log(`🎯 Filtrado por intereses: ${filteredResults.length} artículos relevantes`);
      }

      // Limitar a 15 artículos más relevantes
      const finalResults = filteredResults.slice(0, 15);
      
      // Capturar screenshots de los artículos (solo los primeros 5)
      console.log('📸 Capturando screenshots de artículos...');
      await this.captureScreenshotsForArticles(finalResults.filter(r => r.type === 'article').slice(0, 5));
      
      return finalResults;
    } catch (error) {
      console.error('Error en búsqueda de noticias:', error);
      return [];
    }
  }

  /**
   * Captura screenshots de artículos
   */
  private async captureScreenshotsForArticles(articles: NewsArticle[]): Promise<void> {
    try {
      const urls = articles.map(a => a.url);
      const screenshots = await screenshotService.captureMultipleScreenshots(urls);
      
      // Asignar screenshots a los artículos
      articles.forEach(article => {
        const screenshot = screenshots.get(article.url);
        if (screenshot) {
          article.imageUrl = screenshot;
        }
      });
    } catch (error) {
      console.error('Error capturando screenshots:', error);
    }
  }

  /**
   * Scraping de Google News
   */
  private async searchGoogleNews(query: string): Promise<NewsArticle[]> {
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
        if (index >= 10) return false;

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
            snippet: snippet.substring(0, 250),
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
   * Scraping de BBC News
   */
  private async searchBBC(query: string): Promise<NewsArticle[]> {
    try {
      const encodedQuery = encodeURIComponent(query);
      const url = `https://www.bbc.com/search?q=${encodedQuery}`;
      
      const response = await axios.get(url, {
        timeout: this.timeout,
        headers: { 'User-Agent': this.userAgent }
      });

      const $ = cheerio.load(response.data);
      const articles: NewsArticle[] = [];

      $('article, .ssrcss-1mrs5ns-Stack').each((index, element) => {
        if (index >= 5) return false;

        const $article = $(element);
        const title = $article.find('h2, [data-testid="card-headline"]').first().text().trim();
        const link = $article.find('a').first().attr('href');
        const snippet = $article.find('p, [data-testid="card-description"]').first().text().trim();
        const imageUrl = $article.find('img').first().attr('src');

        if (title && link) {
          const fullUrl = link.startsWith('http') ? link : `https://www.bbc.com${link}`;
          
          articles.push({
            title,
            url: fullUrl,
            snippet: snippet.substring(0, 250) || title,
            source: 'BBC News',
            imageUrl,
            type: 'article'
          });
        }
      });

      return articles;
    } catch (error) {
      console.error('Error scraping BBC:', error);
      return [];
    }
  }

  /**
   * Scraping de CNN
   */
  private async searchCNN(query: string): Promise<NewsArticle[]> {
    try {
      const encodedQuery = encodeURIComponent(query);
      const url = `https://edition.cnn.com/search?q=${encodedQuery}`;
      
      const response = await axios.get(url, {
        timeout: this.timeout,
        headers: { 'User-Agent': this.userAgent }
      });

      const $ = cheerio.load(response.data);
      const articles: NewsArticle[] = [];

      $('.cnn-search__result').each((index, element) => {
        if (index >= 5) return false;

        const $article = $(element);
        const title = $article.find('.cnn-search__result-headline').text().trim();
        const link = $article.find('a').first().attr('href');
        const snippet = $article.find('.cnn-search__result-body').text().trim();
        const imageUrl = $article.find('img').first().attr('src');

        if (title && link) {
          const fullUrl = link.startsWith('http') ? link : `https://edition.cnn.com${link}`;
          
          articles.push({
            title,
            url: fullUrl,
            snippet: snippet.substring(0, 250) || title,
            source: 'CNN',
            imageUrl,
            type: 'article'
          });
        }
      });

      return articles;
    } catch (error) {
      console.error('Error scraping CNN:', error);
      return [];
    }
  }

  /**
   * Scraping de El País
   */
  private async searchElPais(query: string): Promise<NewsArticle[]> {
    try {
      const encodedQuery = encodeURIComponent(query);
      const url = `https://elpais.com/buscar/?q=${encodedQuery}`;
      
      const response = await axios.get(url, {
        timeout: this.timeout,
        headers: { 'User-Agent': this.userAgent }
      });

      const $ = cheerio.load(response.data);
      const articles: NewsArticle[] = [];

      $('article').each((index, element) => {
        if (index >= 5) return false;

        const $article = $(element);
        const title = $article.find('h2').first().text().trim();
        const link = $article.find('a').first().attr('href');
        const snippet = $article.find('p').first().text().trim();
        const imageUrl = $article.find('img').first().attr('src');

        if (title && link) {
          const fullUrl = link.startsWith('http') ? link : `https://elpais.com${link}`;
          
          articles.push({
            title,
            url: fullUrl,
            snippet: snippet.substring(0, 250) || title,
            source: 'El País',
            imageUrl,
            type: 'article'
          });
        }
      });

      return articles;
    } catch (error) {
      console.error('Error scraping El País:', error);
      return [];
    }
  }

  /**
   * Scraping de YouTube para videos de noticias
   */
  private async searchYouTube(query: string): Promise<NewsArticle[]> {
    try {
      const encodedQuery = encodeURIComponent(query + ' noticias');
      const url = `https://www.youtube.com/results?search_query=${encodedQuery}`;
      
      const response = await axios.get(url, {
        timeout: this.timeout,
        headers: { 'User-Agent': this.userAgent }
      });

      const ytInitialDataMatch = response.data.match(/var ytInitialData = ({.*?});/);
      if (!ytInitialDataMatch) {
        return [];
      }

      const ytData = JSON.parse(ytInitialDataMatch[1]);
      const videos: NewsArticle[] = [];

      const contents = ytData?.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents || [];
      
      for (const section of contents) {
        const items = section?.itemSectionRenderer?.contents || [];
        
        for (const item of items) {
          if (videos.length >= 3) break; // Solo 3 videos

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
              snippet: description.substring(0, 250),
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
   * Filtra artículos por intereses del usuario
   */
  private filterByInterests(articles: NewsArticle[], interests: string[]): NewsArticle[] {
    if (interests.length === 0) return articles;

    return articles.filter(article => {
      const content = `${article.title} ${article.snippet}`.toLowerCase();
      return interests.some(interest => 
        content.includes(interest.toLowerCase())
      );
    });
  }

  /**
   * Extrae el contenido completo de un artículo (para análisis profundo)
   */
  async extractArticleContent(url: string): Promise<string> {
    try {
      const response = await axios.get(url, {
        timeout: this.timeout,
        headers: { 'User-Agent': this.userAgent }
      });

      const $ = cheerio.load(response.data);
      
      // Intentar extraer el contenido principal
      const content = $('article p, .article-body p, .story-body p')
        .map((i, el) => $(el).text().trim())
        .get()
        .join(' ');

      return content.substring(0, 2000); // Limitar a 2000 caracteres
    } catch (error) {
      return '';
    }
  }
}

export default new NewsScraperService();
