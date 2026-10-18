import jwt from 'jsonwebtoken';
import { User, JwtPayload } from '../types/index.js';

const JWT_SECRET = process.env.JWT_SECRET || 'electropathy_secret_key_default';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'electropathy_refresh_secret_key_default';

export class TokenService {
  generateTokens(user: User): { accessToken: string; refreshToken: string } {
    const payload: JwtPayload = {
      userId: user.id,
      mobileNumber: user.mobileNumber,
      role: user.role
    };

    // 15-minute Access Token
    const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' });

    // 7-day Refresh Token
    const refreshToken = jwt.sign({ userId: user.id }, JWT_REFRESH_SECRET, { expiresIn: '7d' });

    return { accessToken, refreshToken };
  }

  verifyAccessToken(token: string): JwtPayload {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  }

  verifyRefreshToken(token: string): { userId: string } {
    return jwt.verify(token, JWT_REFRESH_SECRET) as { userId: string };
  }
}

export const tokenService = new TokenService();
