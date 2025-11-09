import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { UserService } from '../services/userService';

const userService = new UserService();

// Расширяем интерфейс Request для добавления userId
declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export async function userMiddleware(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    let userId = req.cookies.user_id;

    if (!userId) {
      userId = uuidv4();
      res.cookie('user_id', userId, {
        httpOnly: true,
        maxAge: 365 * 24 * 60 * 60 * 1000, // 1 year
      });

      // Create user in database
      try {
        await userService.createUser(userId, {});
        console.log('New user created:', userId);
      } catch (error) {
        console.error('Error creating user:', error);
      }
    }

    req.userId = userId;
    next();
  } catch (error) {
    console.error('Error in user middleware:', error);
    next(error);
  }
}