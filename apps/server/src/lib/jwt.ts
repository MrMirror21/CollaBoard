/* eslint-disable prettier/prettier */
export const JWT_SECRET =
  process.env.JWT_SECRET || 'your-secret-key-change-in-production';
export const JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key';

export const JWT_ACCESS_TOKEN_EXPIRES_IN = '15m'; // 15분
export const JWT_REFRESH_TOKEN_EXPIRES_IN = '7d'; // 7일

export interface JwtPayload {
  userId: string;
  email: string;
}
