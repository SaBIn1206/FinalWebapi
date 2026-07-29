import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface TokenPayload {
  jti?: string;
  exp?: number;
  iat?: number;
}

export class TokenBlacklist {
  private revokedTokens: Map<string, number> = new Map();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    if (process.env.NODE_ENV !== 'test') {
      this.cleanupInterval = setInterval(() => this.cleanup(), 60 * 1000);
    }
  }

  revoke(token: string): void {
    try {
      const decoded = jwt.decode(token) as TokenPayload | null;
      if (!decoded || !decoded.exp) return;

      const ttl = (decoded.exp * 1000) - Date.now();
      if (ttl <= 0) return;

      this.revokedTokens.set(token, Date.now() + ttl);
    } catch {
      // ignore decode errors
    }
  }

  isRevoked(token: string): boolean {
    const expiry = this.revokedTokens.get(token);
    if (!expiry) return false;
    if (Date.now() > expiry) {
      this.revokedTokens.delete(token);
      return false;
    }
    return true;
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [token, expiry] of this.revokedTokens.entries()) {
      if (now > expiry) {
        this.revokedTokens.delete(token);
      }
    }
  }

  size(): number {
    return this.revokedTokens.size;
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.revokedTokens.clear();
  }
}

export const tokenBlacklist = new TokenBlacklist();

export const blacklistMiddleware = (req: any, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.split(' ')[1];
  if (tokenBlacklist.isRevoked(token)) {
    return res.status(401).json({
      success: false,
      message: 'Token has been revoked. Please log in again.',
    });
  }

  next();
};
