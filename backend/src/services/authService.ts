import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, IUser, UserRole } from '../models';
import { env } from '../config/env';
import { BadRequestError, UnauthorizedError, NotFoundError } from '../utils/errors';

export interface RegisterDTO {
  name: string;
  email: string;
  password: string;
  studentId: string;
  department?: string;
  phone?: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export const generateToken = (user: IUser): string => {
  return jwt.sign(
    {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    },
    env.JWT_SECRET,
    { expiresIn: '24h' }
  );
};

export const registerUser = async (data: RegisterDTO) => {
  const existing = await User.findOne({ email: data.email.toLowerCase() });
  if (existing) {
    throw new BadRequestError('An account with this email address already exists.');
  }

  const existingRoll = await User.findOne({ studentId: data.studentId.trim() });
  if (existingRoll) {
    throw new BadRequestError('An account with this Student ID / Roll Number already exists.');
  }

  const passwordHash = await bcrypt.hash(data.password, 10);

  const newUser = await User.create({
    name: data.name.trim(),
    email: data.email.toLowerCase().trim(),
    passwordHash,
    role: 'student',
    studentId: data.studentId.trim(),
    department: data.department?.trim(),
    phone: data.phone?.trim(),
    walletBalance: 0,
    status: 'active',
  });

  const token = generateToken(newUser);

  return {
    user: {
      id: newUser._id.toString(),
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      studentId: newUser.studentId,
      department: newUser.department,
      phone: newUser.phone,
      walletBalance: newUser.walletBalance,
    },
    token,
  };
};

export const loginUser = async (data: LoginDTO) => {
  const user = await User.findOne({ email: data.email.toLowerCase().trim() }).select('+passwordHash');
  if (!user) {
    throw new UnauthorizedError('Invalid email or password.');
  }

  const isMatch = await user.comparePassword(data.password);
  if (!isMatch) {
    throw new UnauthorizedError('Invalid email or password.');
  }

  if (user.status !== 'active') {
    throw new UnauthorizedError('Your account has been deactivated or suspended.');
  }

  const token = generateToken(user);

  return {
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      studentId: user.studentId,
      department: user.department,
      phone: user.phone,
      walletBalance: user.walletBalance,
      avatar: user.avatar,
    },
    token,
  };
};

export const getUserProfile = async (userId: string) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new NotFoundError('User profile not found.');
  }
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    studentId: user.studentId,
    department: user.department,
    phone: user.phone,
    walletBalance: user.walletBalance,
    avatar: user.avatar,
    createdAt: user.createdAt,
  };
};

export const updateUserProfile = async (
  userId: string,
  updates: { name?: string; phone?: string; department?: string }
) => {
  const user = await User.findByIdAndUpdate(userId, { $set: updates }, { new: true });
  if (!user) {
    throw new NotFoundError('User not found.');
  }
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    studentId: user.studentId,
    department: user.department,
    phone: user.phone,
    walletBalance: user.walletBalance,
    avatar: user.avatar,
  };
};

export const topupUserWallet = async (userId: string, amount: number) => {
  const user = await User.findByIdAndUpdate(
    userId,
    { $inc: { walletBalance: amount } },
    { new: true }
  );
  if (!user) {
    throw new NotFoundError('User not found.');
  }
  return {
    walletBalance: user.walletBalance,
  };
};
