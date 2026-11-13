import { UserRole } from '../models';

export interface AuthenticatedUserPayload {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  studentId?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUserPayload;
    }
  }
}
