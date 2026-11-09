import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/authMiddleware.js';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'eximia_jwt_super_secret_key_2026_latvia_experience';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export class AuthController {
  public static async register(req: Request, res: Response) {
    try {
      const { email, password, fullName, role } = req.body;
      if (!email || !password || !fullName) {
        return res.status(400).json({ success: false, error: 'Email, password, and full name are required' });
      }

      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        return res.status(409).json({ success: false, error: 'User with this email already exists' });
      }

      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(password, salt);

      const user = await prisma.user.create({
        data: {
          email,
          password_hash,
          full_name: fullName,
          role: role || 'CUSTOMER',
        },
      });

      const token = jwt.sign(
        { userId: user.user_id, email: user.email, role: user.role, fullName: user.full_name },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      return res.status(201).json({
        success: true,
        token,
        user: {
          userId: user.user_id,
          email: user.email,
          fullName: user.full_name,
          role: user.role,
        },
        data: {
          token,
          user: {
            userId: user.user_id,
            email: user.email,
            fullName: user.full_name,
            role: user.role,
          },
        },
      });
    } catch (err: any) {
      console.error('[AuthController.register] Error:', err);
      return res.status(500).json({ success: false, error: 'Failed to register user' });
    }
  }

  public static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ success: false, error: 'Email and password are required' });
      }

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        return res.status(401).json({ success: false, error: 'Invalid email or password' });
      }

      const isValid = await bcrypt.compare(password, user.password_hash);
      if (!isValid) {
        return res.status(401).json({ success: false, error: 'Invalid email or password' });
      }

      const token = jwt.sign(
        { userId: user.user_id, email: user.email, role: user.role, fullName: user.full_name },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      return res.json({
        success: true,
        token,
        user: {
          userId: user.user_id,
          email: user.email,
          fullName: user.full_name,
          role: user.role,
        },
        data: {
          token,
          user: {
            userId: user.user_id,
            email: user.email,
            fullName: user.full_name,
            role: user.role,
          },
        },
      });
    } catch (err: any) {
      console.error('[AuthController.login] Error:', err);
      return res.status(500).json({ success: false, error: 'Failed to authenticate' });
    }
  }

  public static async me(req: AuthRequest, res: Response) {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Not authenticated' });
    }
    return res.json({ success: true, user: req.user });
  }
}
