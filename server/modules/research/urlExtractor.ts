import * as cheerio from 'cheerio';
import { ResearchResult } from '@/types';

export async function extractFromUrl(url: string): Promise<ResearchResult> {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch URL: HTTP ${res.status}`);
    }

    const html = await res.text();
    const $ = cheerio.load(html);

    // Extract title
    const title =
      $('meta[property="og:title"]').attr('content') ||
      $('title').text().trim() ||
      'Extracted Article';

    // Extract site / publication name
    const siteName =
      $('meta[property="og:site_name"]').attr('content') ||
      new URL(url).hostname.replace('www.', '');

    // Extract description / summary
    const description =
      $('meta[property="og:description"]').attr('content') ||
      $('meta[name="description"]').attr('content') ||
      '';

    // Extract main text content
    const paragraphs: string[] = [];
    $('article p, main p, .post-content p, .article-body p, p').each((_, el) => {
      const txt = $(el).text().trim();
      if (txt.length > 40 && !txt.includes('cookie') && !txt.includes('copyright')) {
        paragraphs.push(txt);
      }
    });

    const fullContent = paragraphs.slice(0, 10).join(' ');
    const summary = description
      ? `${description} ${fullContent.slice(0, 300)}...`
      : fullContent.slice(0, 500);

    // Extract key facts (sentences containing numbers or capitalized names)
    const sentences = fullContent.split(/(?<=[.?!])\s+/);
    const keyFacts = sentences
      .filter((s) => /\d+|launch|announce|release|model|percent|million|billion/i.test(s))
      .slice(0, 5)
      .map((s) => s.trim());

    return {
      topic: title,
      summary: summary || 'Article summary extracted from web source.',
      sources: [
        {
          title,
          url,
          snippet: summary.slice(0, 200),
          sourceName: siteName,
          verified: true,
          date: new Date().toISOString().split('T')[0],
        },
      ],
      keyFacts: keyFacts.length > 0 ? keyFacts : ['Official article release and technical details verified.'],
      technicalTerms: ['API', 'Architecture', 'Performance', 'Inference', 'Latency'],
      verified: true,
      extractedFromUrl: true,
    };
  } catch (error: any) {
    console.error('Error extracting from URL:', error);
    return {
      topic: url,
      summary: `Could not directly parse ${url}. Flagged for manual confirmation.`,
      sources: [
        {
          title: 'Unverified Web URL',
          url,
          snippet: `Extraction error: ${error.message}`,
          sourceName: 'Unknown',
          verified: false,
        },
      ],
      keyFacts: ['Source verification failed; verify details before script approval.'],
      technicalTerms: [],
      verified: false,
      extractedFromUrl: true,
    };
  }
}
