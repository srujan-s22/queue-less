import { Request, Response, NextFunction } from 'express';
import {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  topupUserWallet,
} from '../services/authService';
import { sendSuccess } from '../utils/response';
import { env } from '../config/env';

const getCookieOptions = () => ({
  httpOnly: true,
  secure: env.IS_PRODUCTION,
  sameSite: env.IS_PRODUCTION ? ('none' as const) : ('lax' as const),
  path: '/',
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
});

const getClearCookieOptions = () => ({
  httpOnly: true,
  secure: env.IS_PRODUCTION,
  sameSite: env.IS_PRODUCTION ? ('none' as const) : ('lax' as const),
  path: '/',
});

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user, token } = await registerUser(req.body);
    res.cookie('token', token, getCookieOptions());
    return sendSuccess(res, { user, token }, 'Registration successful', 201);
  } catch (error) {
    return next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user, token } = await loginUser(req.body);
    res.cookie('token', token, getCookieOptions());
    return sendSuccess(res, { user, token }, 'Login successful');
  } catch (error) {
    return next(error);
  }
};

export const logout = async (_req: Request, res: Response) => {
  res.clearCookie('token', getClearCookieOptions());
  return sendSuccess(res, null, 'Logged out successfully');
};

export const getMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const profile = await getUserProfile(req.user!.id);
    return sendSuccess(res, profile);
  } catch (error) {
    return next(error);
  }
};

export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const updated = await updateUserProfile(req.user!.id, req.body);
    return sendSuccess(res, updated, 'Profile updated successfully');
  } catch (error) {
    return next(error);
  }
};

export const topupWallet = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const updated = await topupUserWallet(req.user!.id, req.body.amount);
    return sendSuccess(res, updated, 'Wallet topped up successfully');
  } catch (error) {
    return next(error);
  }
};
