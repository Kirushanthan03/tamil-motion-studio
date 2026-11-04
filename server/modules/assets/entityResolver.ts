export interface ResolvedEntity {
  name: string;
  type: 'person' | 'company' | 'crypto' | 'tech';
  roleOrSubtitle: string;
  imageUrl?: string;
  logoUrl?: string;
  badge?: string;
}

// Curated high-res verified assets for instantaneous 0ms resolution
const CURATED_ENTITIES: Record<string, ResolvedEntity> = {
  binance: {
    name: 'Binance',
    type: 'company',
    roleOrSubtitle: 'Global Cryptocurrency Exchange',
    logoUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/9/9a/Binance-BNB-Icon-Logo.wine.svg/330px-Binance-BNB-Icon-Logo.wine.svg.png',
    badge: 'EXCHANGE // CRYPTO',
  },
  cz: {
    name: 'Changpeng Zhao (CZ)',
    type: 'person',
    roleOrSubtitle: 'Founder & Former CEO, Binance',
    imageUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e1/Changpeng_Zhao_in_2022.jpg/330px-Changpeng_Zhao_in_2022.jpg',
    badge: 'KEY FIGURE // FOUNDER',
  },
  'changpeng zhao': {
    name: 'Changpeng Zhao (CZ)',
    type: 'person',
    roleOrSubtitle: 'Founder & Former CEO, Binance',
    imageUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e1/Changpeng_Zhao_in_2022.jpg/330px-Changpeng_Zhao_in_2022.jpg',
    badge: 'KEY FIGURE // FOUNDER',
  },
  'richard teng': {
    name: 'Richard Teng',
    type: 'person',
    roleOrSubtitle: 'CEO, Binance (2023–Present)',
    imageUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/5/5e/RichardTeng_BBW2023_Istanbul1.jpg/330px-RichardTeng_BBW2023_Istanbul1.jpg',
    badge: 'BINANCE CEO // LEADERSHIP',
  },
  'tradertraitor': {
    name: 'TraderTraitor (Lazarus)',
    type: 'tech',
    roleOrSubtitle: 'State-Sponsored Threat Actor (DPRK)',
    badge: 'THREAT ACTOR // DPRK',
  },
  'lazarus': {
    name: 'Lazarus Group',
    type: 'tech',
    roleOrSubtitle: 'State-Sponsored Cyber Unit',
    badge: 'THREAT ACTOR // DPRK',
  },
  'elon musk': {
    name: 'Elon Musk',
    type: 'person',
    roleOrSubtitle: 'CEO, Tesla & xAI / Owner, X',
    imageUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/6/69/Elon_Musk_-_54820081119_%283x4_cropped%2C_Rule_of_thirds%29.jpg/330px-Elon_Musk_-_54820081119_%283x4_cropped%2C_Rule_of_thirds%29.jpg',
    badge: 'KEY FIGURE // VISIONARY',
  },
  elon: {
    name: 'Elon Musk',
    type: 'person',
    roleOrSubtitle: 'CEO, Tesla & xAI / Owner, X',
    imageUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/6/69/Elon_Musk_-_54820081119_%283x4_cropped%2C_Rule_of_thirds%29.jpg/330px-Elon_Musk_-_54820081119_%283x4_cropped%2C_Rule_of_thirds%29.jpg',
    badge: 'KEY FIGURE // VISIONARY',
  },
  'sam altman': {
    name: 'Sam Altman',
    type: 'person',
    roleOrSubtitle: 'CEO, OpenAI',
    imageUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/5/58/Sam_Altman_TechCrunch_Disrupt_2019_%28cropped%29.jpg/330px-Sam_Altman_TechCrunch_Disrupt_2019_%28cropped%29.jpg',
    badge: 'KEY FIGURE // AI LEADER',
  },
  openai: {
    name: 'OpenAI',
    type: 'company',
    roleOrSubtitle: 'Artificial Intelligence Research Lab',
    logoUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/4/4d/OpenAI_Logo.svg/330px-OpenAI_Logo.svg.png',
    badge: 'AI LAB // CREATOR',
  },
  'jensen huang': {
    name: 'Jensen Huang',
    type: 'person',
    roleOrSubtitle: 'Founder & CEO, NVIDIA',
    imageUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/c/ca/Jensen_Huang_at_Computex_2024.jpg/330px-Jensen_Huang_at_Computex_2024.jpg',
    badge: 'KEY FIGURE // GPU ARCHITECT',
  },
  nvidia: {
    name: 'NVIDIA',
    type: 'company',
    roleOrSubtitle: 'Accelerated Computing & AI Hardware',
    logoUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/2/21/Nvidia_logo.svg/330px-Nvidia_logo.svg.png',
    badge: 'HARDWARE // ACCELERATED AI',
  },
  apple: {
    name: 'Apple',
    type: 'company',
    roleOrSubtitle: 'Technology & Consumer Hardware',
    logoUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/f/fa/Apple_logo_black.svg/330px-Apple_logo_black.svg.png',
    badge: 'TECH GIANT // ECOSYSTEM',
  },
  'tim cook': {
    name: 'Tim Cook',
    type: 'person',
    roleOrSubtitle: 'CEO, Apple Inc.',
    imageUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d5/Tim_Cook_2017_%28cropped%29.jpg/330px-Tim_Cook_2017_%28cropped%29.jpg',
    badge: 'KEY FIGURE // CEO',
  },
  bitcoin: {
    name: 'Bitcoin (BTC)',
    type: 'crypto',
    roleOrSubtitle: 'Decentralized Digital Currency',
    logoUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/4/46/Bitcoin.svg/330px-Bitcoin.svg.png',
    badge: 'CRYPTO // LAYER 1',
  },
  btc: {
    name: 'Bitcoin (BTC)',
    type: 'crypto',
    roleOrSubtitle: 'Decentralized Digital Currency',
    logoUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/4/46/Bitcoin.svg/330px-Bitcoin.svg.png',
    badge: 'CRYPTO // RESERVE ASSET',
  },
  ethereum: {
    name: 'Ethereum (ETH)',
    type: 'crypto',
    roleOrSubtitle: 'Smart Contract Platform',
    logoUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/0/05/Ethereum_logo_2014.svg/330px-Ethereum_logo_2014.svg.png',
    badge: 'CRYPTO // SMART CONTRACTS',
  },
  'vitalik buterin': {
    name: 'Vitalik Buterin',
    type: 'person',
    roleOrSubtitle: 'Co-Founder, Ethereum',
    imageUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/1/1c/Vitalik_Buterin_TechCrunch_London_2015_%28cropped%29.jpg/330px-Vitalik_Buterin_TechCrunch_London_2015_%28cropped%29.jpg',
    badge: 'KEY FIGURE // PROTOCOL ARCHITECT',
  },
  deepseek: {
    name: 'DeepSeek AI',
    type: 'company',
    roleOrSubtitle: 'Open-Source MoE AI Research',
    logoUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/8/8a/DeepSeek_logo.svg/330px-DeepSeek_logo.svg.png',
    badge: 'OPEN AI // MOE ARCHITECTURE',
  },
};

export class EntityResolver {
  /**
   * Synchronous resolution from curated dictionary (0ms)
   */
  resolveSync(query: string): ResolvedEntity | null {
    const clean = query.trim().toLowerCase();
    if (!clean) return null;

    if (CURATED_ENTITIES[clean]) {
      return CURATED_ENTITIES[clean];
    }

    for (const [key, entity] of Object.entries(CURATED_ENTITIES)) {
      if (clean.includes(key) || key.includes(clean)) {
        return entity;
      }
    }
    return null;
  }

  /**
   * Synchronous detection in scene text from curated dictionary
   */
  detectInSceneSync(sceneText: string): ResolvedEntity | null {
    const lower = sceneText.toLowerCase();
    const checkOrder = [
      'changpeng zhao',
      'cz',
      'elon musk',
      'elon',
      'sam altman',
      'jensen huang',
      'tim cook',
      'vitalik buterin',
      'binance',
      'openai',
      'nvidia',
      'apple',
      'deepseek',
      'bitcoin',
      'btc',
      'ethereum',
    ];

    for (const key of checkOrder) {
      const regex = new RegExp(`\\b${key}\\b`, 'i');
      if (regex.test(lower)) {
        return this.resolveSync(key);
      }
    }
    return null;
  }

  /**
   * Resolve an entity by name using curated dictionary or live Wikipedia Summary REST API
   */
  async resolve(query: string, typeHint?: 'person' | 'company' | 'crypto'): Promise<ResolvedEntity | null> {
    const clean = query.trim().toLowerCase();
    if (!clean) return null;

    // 1. Direct curated match
    if (CURATED_ENTITIES[clean]) {
      return CURATED_ENTITIES[clean];
    }

    // Check partial matches in curated keys
    for (const [key, entity] of Object.entries(CURATED_ENTITIES)) {
      if (clean.includes(key) || key.includes(clean)) {
        return entity;
      }
    }

    // 2. Query Wikipedia REST API
    try {
      const wikiTitle = query.trim().replace(/\s+/g, '_');
      const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(wikiTitle)}`;
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'TamilMotionStudio/1.0 (https://github.com/Kirushanthan03/tamil-motion-studio)',
        },
      });

      if (res.ok) {
        const data = await res.json();
        const description = data.description || '';
        const title = data.title || query;
        const thumbnail = data.thumbnail?.source;

        if (thumbnail) {
          const isPerson =
            typeHint === 'person' ||
            description.toLowerCase().includes('born') ||
            description.toLowerCase().includes('businessman') ||
            description.toLowerCase().includes('entrepreneur') ||
            description.toLowerCase().includes('scientist') ||
            description.toLowerCase().includes('executive') ||
            description.toLowerCase().includes('ceo') ||
            description.toLowerCase().includes('developer');

          return {
            name: title,
            type: isPerson ? 'person' : (typeHint || 'company'),
            roleOrSubtitle: description || (isPerson ? 'Key Industry Figure' : 'Organization / Platform'),
            imageUrl: isPerson ? thumbnail : undefined,
            logoUrl: !isPerson ? thumbnail : undefined,
            badge: isPerson ? 'FEATURED FIGURE' : 'ORGANIZATION // BRAND',
          };
        }
      }
    } catch (err) {
      console.warn(`Wikipedia entity lookup failed for "${query}":`, err);
    }

    return null;
  }

  /**
   * Scan scene text and extract relevant entities
   */
  async detectAndResolveInScene(sceneText: string): Promise<ResolvedEntity | null> {
    const lower = sceneText.toLowerCase();

    // Check prioritized entities
    const checkOrder = [
      'changpeng zhao',
      'cz',
      'elon musk',
      'elon',
      'sam altman',
      'jensen huang',
      'tim cook',
      'vitalik buterin',
      'binance',
      'openai',
      'nvidia',
      'apple',
      'deepseek',
      'bitcoin',
      'btc',
      'ethereum',
    ];

    for (const key of checkOrder) {
      const regex = new RegExp(`\\b${key}\\b`, 'i');
      if (regex.test(lower)) {
        return this.resolve(key);
      }
    }

    return null;
  }
}

export const entityResolver = new EntityResolver();
