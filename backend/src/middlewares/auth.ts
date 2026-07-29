import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { AppError } from './error';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    name: string;
  };
}

interface TokenPayload extends JwtPayload {
  id: string;
  email: string;
  role: string;
  name: string;
}

export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  // Debug logs (remove in production)
  console.log('====================================');
  console.log('Request:', req.method, req.originalUrl);
  console.log('Authorization Header:', req.headers.authorization);
  console.log('====================================');

  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return next(new AppError('No Authorization header provided.', 401));
  }

  if (!authHeader.startsWith('Bearer ')) {
    return next(new AppError('Invalid authorization format. Use Bearer <token>.', 401));
  }

  const token = authHeader.substring(7).trim();

  if (!token) {
    return next(new AppError('Authentication token is missing.', 401));
  }

  try {
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      return next(new AppError('JWT_SECRET is not configured.', 500));
    }

    const decoded = jwt.verify(token, secret, {
      algorithms: ['HS256'],
    }) as TokenPayload;

    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      name: decoded.name,
    };

    next();
  } catch (error) {
    console.error('JWT Verification Error:', error);
    return next(new AppError('Invalid or expired authentication token.', 401));
  }
};

export const authorize = (...roles: string[]) => {
  return (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): void => {
    if (!req.user) {
      return next(new AppError('Authentication required.', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          `Access denied. Required role(s): ${roles.join(', ')}`,
          403
        )
      );
    }

    next();
  };
};