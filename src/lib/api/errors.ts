export interface ValidationErrorItem {
  field: string;
  message: string;
}

export class ApiError extends Error {
  public statusCode: number;
  public errors?: ValidationErrorItem[];

  constructor(message: string, statusCode = 500, errors?: ValidationErrorItem[]) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.errors = errors;
    Object.setPrototypeOf(this, ApiError.prototype);
  }

  static isApiError(err: unknown): err is ApiError {
    return err instanceof ApiError;
  }
}
