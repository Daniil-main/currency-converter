import { Router } from 'express';
import { RatesController } from '../controllers/ratesController';

const router = Router();
const ratesController = new RatesController();

/**
 * @swagger
 * /api/rates:
 *   get:
 *     summary: Get exchange rates
 *     parameters:
 *       - in: query
 *         name: base
 *         schema:
 *           type: string
 *         description: Base currency code
 *       - in: query
 *         name: targets
 *         schema:
 *           type: string
 *         description: Comma-separated list of target currency codes
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 base:
 *                   type: string
 *                 rates:
 *                   type: object
 *                   additionalProperties:
 *                     type: number
 *                 timestamp:
 *                   type: number
 */
router.get('/rates', (req, res) => ratesController.getRates(req, res));

export { router as ratesRoutes };