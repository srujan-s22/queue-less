import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { UnauthorizedError } from '../utils/errors';
import { User } from '../models';
import { AuthenticatedUserPayload } from '../types';

interface JwtPayload {
  id: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

export const authenticate = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    let token: string | undefined;

    // 1. Try reading from cookie
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    // 2. Fallback to Authorization Header
    if (!token && req.headers.authorization) {
      const parts = req.headers.authorization.split(' ');
      if (parts.length === 2 && parts[0] === 'Bearer') {
        token = parts[1];
      }
    }

    if (!token) {
      throw new UnauthorizedError('Authentication token missing. Please sign in.');
    }

    // 3. Verify token
    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;

    // 4. Ensure user exists and is active in database
    const user = await User.findById(decoded.id).select('+passwordHash');
    if (!user || user.status !== 'active') {
      throw new UnauthorizedError('User account not found or deactivated.');
    }

    // 5. Attach payload to req.user
    req.user = {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name,
      studentId: user.studentId,
    };

    return next();
  } catch (error: any) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return next(new UnauthorizedError('Invalid or expired authentication session.'));
    }
    return next(error);
  }
};

export const optionalAuth = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    let token: string | undefined;
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    } else if (req.headers.authorization) {
      const parts = req.headers.authorization.split(' ');
      if (parts.length === 2 && parts[0] === 'Bearer') {
        token = parts[1];
      }
    }

    if (!token) {
      return next();
    }

    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    const user = await User.findById(decoded.id);
    if (user && user.status === 'active') {
      req.user = {
        id: user._id.toString(),
        email: user.email,
        role: user.role,
        name: user.name,
        studentId: user.studentId,
      };
    }
    return next();
  } catch {
    // If optional token is invalid, proceed without req.user
    return next();
  }
};
