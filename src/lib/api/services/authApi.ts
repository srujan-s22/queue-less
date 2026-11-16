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
import { setAuthToken, clearAuthToken } from '../token';

export const authApi = {
  login: async (credentials: LoginRequest): Promise<User> => {
    const res = await apiClient<AuthResponseData>(ENDPOINTS.AUTH.LOGIN, {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    if (res.data?.token) {
      setAuthToken(res.data.token);
    }
    return adaptUser(res.data.user);
  },

  register: async (data: RegisterRequest): Promise<User> => {
    const res = await apiClient<AuthResponseData>(ENDPOINTS.AUTH.REGISTER, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (res.data?.token) {
      setAuthToken(res.data.token);
    }
    return adaptUser(res.data.user);
  },

  logout: async (): Promise<void> => {
    try {
      await apiClient(ENDPOINTS.AUTH.LOGOUT, {
        method: 'POST',
      });
    } finally {
      clearAuthToken();
    }
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

  topupWallet: async (amount: number, idempotencyKey?: string): Promise<{ walletBalance: number }> => {
    const headers: Record<string, string> = {};
    if (idempotencyKey) {
      headers['Idempotency-Key'] = idempotencyKey;
    }
    const res = await apiClient<{ walletBalance: number }>(ENDPOINTS.USERS.WALLET_TOPUP, {
      method: 'POST',
      headers,
      body: JSON.stringify({ amount } as WalletTopupRequest),
    });
    return res.data;
  },
};
