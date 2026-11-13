import { apiClient } from '../client';
import { ENDPOINTS } from '../endpoints';
import {
  LoginRequest,
  RegisterRequest,
  AuthResponseData,
  UpdateProfileRequest,
  WalletTopupRequest,
} from '../types';
import { adaptUser } from '../adapters';
import { User } from '@/types';

export const authApi = {
  login: async (credentials: LoginRequest): Promise<User> => {
    const res = await apiClient<AuthResponseData>(ENDPOINTS.AUTH.LOGIN, {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    return adaptUser(res.data.user);
  },

  register: async (data: RegisterRequest): Promise<User> => {
    const res = await apiClient<AuthResponseData>(ENDPOINTS.AUTH.REGISTER, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return adaptUser(res.data.user);
  },

  logout: async (): Promise<void> => {
    await apiClient(ENDPOINTS.AUTH.LOGOUT, {
      method: 'POST',
    });
  },

  getMe: async (): Promise<User> => {
    const res = await apiClient<User>(ENDPOINTS.AUTH.ME);
    return adaptUser(res.data);
  },

  updateProfile: async (updates: UpdateProfileRequest): Promise<User> => {
    const res = await apiClient<User>(ENDPOINTS.USERS.PROFILE, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
    return adaptUser(res.data);
  },

  topupWallet: async (amount: number): Promise<{ walletBalance: number }> => {
    const res = await apiClient<{ walletBalance: number }>(ENDPOINTS.USERS.WALLET_TOPUP, {
      method: 'POST',
      body: JSON.stringify({ amount } as WalletTopupRequest),
    });
    return res.data;
  },
};
