import { Request, Response } from 'express';
import { CurrencyService } from '../services/currencyService';
import { UserService } from '../services/userService';

const currencyService = new CurrencyService();
const userService = new UserService();

export class RatesController {
  async getRates(req: Request, res: Response): Promise<void> {
    try {
      const { base: queryBase, targets } = req.query;
      
      if (!req.userId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      if (!targets) {
        res.status(400).json({ error: 'Targets parameter is required' });
        return;
      }

      const targetCurrencies = (targets as string).split(',').map(c => c.trim().toUpperCase());
      
      // Validate currencies format
      for (const currency of [queryBase, ...targetCurrencies]) {
        if (currency && !/^[A-Z]{3}$/.test(currency)) {
          res.status(400).json({ error: `Invalid currency format: ${currency}` });
          return;
        }
      }
      
      let baseCurrency = (queryBase as string)?.toUpperCase();
      
      if (!baseCurrency) {
        const user = await userService.getUser(req.userId);
        baseCurrency = user?.base_currency || 'USD';
      }

      const rates = await currencyService.getExchangeRates(baseCurrency, targetCurrencies);

      res.json({
        base: baseCurrency,
        rates,
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error('Error fetching rates:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}