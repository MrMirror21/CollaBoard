if (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_SECRET) {
  throw new Error('JWT_SECRET or JWT_REFRESH_SECRET is not set');
}

export const { JWT_SECRET, JWT_REFRESH_SECRET } = process.env;

export const JWT_ACCESS_TOKEN_EXPIRES_IN = '15m'; // 15분
export const JWT_REFRESH_TOKEN_EXPIRES_IN = '7d'; // 7일

export interface JwtPayload {
  userId: string;
  email: string;
}
