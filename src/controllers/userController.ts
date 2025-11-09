import { Request, Response } from 'express';
import { UserService } from '../services/userService';

const userService = new UserService();

export class UserController {
  async getUser(req: Request, res: Response): Promise<void> {
    try {
      if (!req.userId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      const user = await userService.getUser(req.userId);

      if (!user) {
        // Create user if doesn't exist
        const newUser = await userService.createUser(req.userId, {});
        res.json(newUser);
        return;
      }

      res.json(user);
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async updateUser(req: Request, res: Response): Promise<void> {
    try {
      if (!req.userId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      const { base_currency, favorites } = req.body;

      // Validate base_currency format
      if (base_currency && !/^[A-Z]{3}$/.test(base_currency)) {
        res.status(400).json({ error: 'Invalid base_currency format' });
        return;
      }

      // Validate favorites format
      if (favorites && Array.isArray(favorites)) {
        for (const currency of favorites) {
          if (!/^[A-Z]{3}$/.test(currency)) {
            res.status(400).json({ error: `Invalid currency in favorites: ${currency}` });
            return;
          }
        }
      }

      const updates: any = {};
      if (base_currency) updates.base_currency = base_currency;
      if (favorites) updates.favorites = favorites;

      const updatedUser = await userService.updateUser(req.userId, updates);

      res.json({
        message: 'User settings updated successfully',
        user: updatedUser,
      });
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}