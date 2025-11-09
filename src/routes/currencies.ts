import { Router } from 'express';
import { CurrencyController } from '../controllers/currencyController';

const router = Router();
const currencyController = new CurrencyController();

/**
 * @swagger
 * /api/currencies:
 *   get:
 *     summary: Get supported currencies
 *     description: Returns list of supported currencies in ISO4217 format
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 currencies:
 *                   type: array
 *                   items:
 *                     type: string
 *                     example: "USD"
 */
router.get('/currencies', (req, res) => currencyController.getCurrencies(req, res));

export { router as currencyRoutes };