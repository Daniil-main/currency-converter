import axios from 'axios';
import NodeCache from 'node-cache';

const currencyCache = new NodeCache({ stdTTL: 3600 }); // 1 hour cache
const ratesCache = new NodeCache({ stdTTL: 86400 }); // 24 hours cache
const requestCache = new NodeCache({ stdTTL: 300 }); // 5 minutes cache

export class CurrencyService {
  private readonly API_KEY = process.env.EXCHANGE_RATE_API_KEY;
  private readonly BASE_URL = 'https://api.exchangerate-api.com/v4/latest';

  async getSupportedCurrencies(): Promise<string[]> {
    try {
      const cachedCurrencies = currencyCache.get<string[]>('supported-currencies');
      if (cachedCurrencies) {
        return cachedCurrencies;
      }

      // For demo purposes, return a static list
      // In production, you might fetch this from an API
      const currencies = [
        'USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 
        'HKD', 'NZD', 'SEK', 'KRW', 'SGD', 'NOK', 'MXN', 'INR',
        'RUB', 'ZAR', 'TRY', 'BRL', 'TWD', 'DKK', 'PLN', 'THB',
        'IDR', 'HUF', 'CZK', 'ILS', 'CLP', 'PHP', 'AED', 'COP',
        'SAR', 'MYR', 'RON', 'BGN', 'HRK', 'ISK'
      ];

      currencyCache.set('supported-currencies', currencies);
      return currencies;
    } catch (error) {
      console.error('Error in getSupportedCurrencies:', error);
      throw new Error('Failed to fetch supported currencies');
    }
  }

  async getExchangeRates(base: string, targets: string[]): Promise<Record<string, number>> {
    try {
      const cacheKey = `${base}-${targets.sort().join(',')}`;
      
      // Check request cache (5 minutes)
      const cachedRequest = requestCache.get<Record<string, number>>(cacheKey);
      if (cachedRequest) {
        return cachedRequest;
      }

      const rates: Record<string, number> = {};

      for (const target of targets) {
        if (base === target) {
          rates[target] = 1;
          continue;
        }

        const pairCacheKey = `${base}-${target}`;
        const cachedRate = ratesCache.get<number>(pairCacheKey);
        
        if (cachedRate) {
          rates[target] = cachedRate;
        } else {
          try {
            const rate = await this.fetchExchangeRate(base, target);
            rates[target] = rate;
            ratesCache.set(pairCacheKey, rate);
          } catch (error) {
            console.error(`Error fetching rate for ${base}-${target}:`, error);
            // Fallback to mock rate for demo
            rates[target] = this.getMockRate(base, target);
          }
        }
      }

      // Cache the complete request result for 5 minutes
      requestCache.set(cacheKey, rates);
      return rates;
    } catch (error) {
      console.error('Error in getExchangeRates:', error);
      throw new Error('Failed to fetch exchange rates');
    }
  }

  private async fetchExchangeRate(base: string, target: string): Promise<number> {
    try {
      // Using Frankfurter.app as it doesn't require API key
      const response = await axios.get(`https://api.frankfurter.app/latest?from=${base}&to=${target}`);
      
      if (response.data && response.data.rates && response.data.rates[target]) {
        return response.data.rates[target];
      } else {
        throw new Error(`Rate for ${target} not found in response`);
      }
    } catch (error) {
      console.error(`API error for ${base}-${target}:`, error);
      // Fallback to mock rate
      return this.getMockRate(base, target);
    }
  }

  private getMockRate(base: string, target: string): number {
    // Mock rates for demo purposes when API fails
    const mockRates: Record<string, Record<string, number>> = {
      USD: { EUR: 0.85, GBP: 0.73, JPY: 110.5, CAD: 1.25, AUD: 1.35, CHF: 0.92, CNY: 6.45 },
      EUR: { USD: 1.18, GBP: 0.86, JPY: 130.0, CAD: 1.47, AUD: 1.59, CHF: 1.08, CNY: 7.59 },
      GBP: { USD: 1.37, EUR: 1.16, JPY: 151.0, CAD: 1.71, AUD: 1.85, CHF: 1.26, CNY: 8.83 }
    };

    return mockRates[base]?.[target] || (0.5 + Math.random());
  }
}