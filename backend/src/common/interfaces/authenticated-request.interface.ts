import { Request } from 'express';
import { UserRole } from '../enums/user-role.enum';

export interface AuthUser {
  userId: number;
  role: UserRole;
}

export interface AuthenticatedRequest extends Request {
  user: AuthUser;
}
