import { API_BASE_URL } from './endpoints';
import { ApiError } from './errors';
import { ApiResponse } from './types';

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

export const apiClient = async <T = any>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> => {
  const { params, headers, ...customConfig } = options;

  let url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += (url.includes('?') ? '&' : '?') + queryString;
    }
  }

  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  const config: RequestInit = {
    method: 'GET',
    credentials: 'include', // Includes HTTP-only session cookies
    headers: {
      ...defaultHeaders,
      ...headers,
    },
    ...customConfig,
  };

  try {
    const response = await fetch(url, config);

    // Check for CSV or binary downloads
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('text/csv')) {
      const csvText = await response.text();
      return {
        success: true,
        data: csvText as unknown as T,
      };
    }

    const data: ApiResponse<T> = await response.json().catch(() => ({
      success: false,
      message: 'Failed to parse JSON response from server',
      data: null as unknown as T,
    }));

    if (!response.ok || data.success === false) {
      throw new ApiError(
        data.message || `Request failed with HTTP status ${response.status}`,
        response.status,
        data.errors
      );
    }

    return data;
  } catch (error: any) {
    if (error instanceof ApiError) {
      throw error;
    }
    // Network errors or aborted requests
    throw new ApiError(
      error.message || 'Network communication error with QueueLess server',
      0
    );
  }
};
