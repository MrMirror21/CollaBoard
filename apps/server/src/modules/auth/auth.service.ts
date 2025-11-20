import bcrypt from 'bcrypt';
import { prisma } from '../../lib/prisma.js';
import type {
  RegisterRequest,
  LoginRequest,
  AuthResponse,
} from './auth.types.js';

const SALT_ROUNDS = 10;

export async function register(data: RegisterRequest): Promise<AuthResponse> {
  // 이메일 중복 확인
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existingUser) {
    throw new Error('이미 존재하는 이메일입니다.');
  }

  // 비밀번호 해싱
  const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);

  // 사용자 생성
  const user = await prisma.user.create({
    data: {
      email: data.email,
      password: hashedPassword,
      name: data.name,
    },
  });

  // 비밀번호 제외한 사용자 정보 반환
  return {
    accessToken: '', // JWT는 컨트롤러에서 생성
    refreshToken: '',
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
    },
  };
}

export async function login(data: LoginRequest): Promise<AuthResponse> {
  // 사용자 조회
  const user = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (!user) {
    throw new Error('이메일 또는 비밀번호가 올바르지 않습니다.');
  }

  // 비밀번호 검증
  const isPasswordValid = await bcrypt.compare(data.password, user.password);

  if (!isPasswordValid) {
    throw new Error('이메일 또는 비밀번호가 올바르지 않습니다.');
  }

  return {
    accessToken: '',
    refreshToken: '',
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
    },
  };
}

export async function getUserById(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      avatar: true,
    },
  });

  if (!user) {
    throw new Error('사용자를 찾을 수 없습니다.');
  }

  return user;
}
