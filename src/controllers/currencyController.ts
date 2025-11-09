import { Request, Response } from 'express';
import { CurrencyService } from '../services/currencyService';

const currencyService = new CurrencyService();

export class CurrencyController {
  async getCurrencies(req: Request, res: Response): Promise<void> {
    try {
      const currencies = await currencyService.getSupportedCurrencies();
      res.json({ currencies });
    } catch (error) {
      console.error('Error fetching currencies:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}