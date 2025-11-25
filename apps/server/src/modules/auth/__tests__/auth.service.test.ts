import { describe, it, expect, vi, beforeEach } from 'vitest';
import bcrypt from 'bcrypt';
import { register, login, getUserById } from '../auth.service.js';

// 모킹된 prisma import
import { prisma } from '../../../lib/prisma.js';

// Prisma 모킹
vi.mock('../../../lib/prisma.js', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}));

// bcrypt 모킹
vi.mock('bcrypt', () => ({
  default: {
    hash: vi.fn(),
    compare: vi.fn(),
  },
}));

const mockPrismaUser = prisma.user as unknown as {
  findUnique: ReturnType<typeof vi.fn>;
  create: ReturnType<typeof vi.fn>;
};

const mockBcrypt = bcrypt as unknown as {
  hash: ReturnType<typeof vi.fn>;
  compare: ReturnType<typeof vi.fn>;
};

describe('auth.service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('register', () => {
    it('정상적인 회원가입 시 사용자를 생성한다', async () => {
      // Given
      const registerData = {
        email: 'test@example.com',
        password: 'password123',
        name: '테스트 유저',
      };

      const hashedPassword = 'hashed_password_123';
      const createdUser = {
        id: 'user-uuid-123',
        email: registerData.email,
        name: registerData.name,
        avatar: null,
        password: hashedPassword,
      };

      mockPrismaUser.findUnique.mockResolvedValue(null); // 중복 없음
      mockBcrypt.hash.mockResolvedValue(hashedPassword);
      mockPrismaUser.create.mockResolvedValue(createdUser);

      // When
      const result = await register(registerData);

      // Then
      expect(mockPrismaUser.findUnique).toHaveBeenCalledWith({
        where: { email: registerData.email },
      });
      expect(mockBcrypt.hash).toHaveBeenCalledWith(registerData.password, 10);
      expect(mockPrismaUser.create).toHaveBeenCalledWith({
        data: {
          email: registerData.email,
          password: hashedPassword,
          name: registerData.name,
        },
      });
      expect(result.user).toEqual({
        id: createdUser.id,
        email: createdUser.email,
        name: createdUser.name,
        avatar: createdUser.avatar,
      });
    });

    it('중복 이메일로 회원가입 시 에러를 발생시킨다', async () => {
      // Given
      const registerData = {
        email: 'existing@example.com',
        password: 'password123',
        name: '테스트 유저',
      };

      const existingUser = {
        id: 'existing-user-id',
        email: registerData.email,
        name: '기존 유저',
      };

      mockPrismaUser.findUnique.mockResolvedValue(existingUser);

      // When & Then
      await expect(register(registerData)).rejects.toThrow(
        '이미 존재하는 이메일입니다.',
      );
      expect(mockPrismaUser.create).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('올바른 자격증명으로 로그인에 성공한다', async () => {
      // Given
      const loginData = {
        email: 'test@example.com',
        password: 'password123',
      };

      const user = {
        id: 'user-uuid-123',
        email: loginData.email,
        name: '테스트 유저',
        avatar: null,
        password: 'hashed_password',
      };

      mockPrismaUser.findUnique.mockResolvedValue(user);
      mockBcrypt.compare.mockResolvedValue(true);

      // When
      const result = await login(loginData);

      // Then
      expect(mockPrismaUser.findUnique).toHaveBeenCalledWith({
        where: { email: loginData.email },
      });
      expect(mockBcrypt.compare).toHaveBeenCalledWith(
        loginData.password,
        user.password,
      );
      expect(result.user).toEqual({
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
      });
    });

    it('잘못된 비밀번호로 로그인 시 에러를 발생시킨다', async () => {
      // Given
      const loginData = {
        email: 'test@example.com',
        password: 'wrong_password',
      };

      const user = {
        id: 'user-uuid-123',
        email: loginData.email,
        name: '테스트 유저',
        avatar: null,
        password: 'hashed_password',
      };

      mockPrismaUser.findUnique.mockResolvedValue(user);
      mockBcrypt.compare.mockResolvedValue(false);

      // When & Then
      await expect(login(loginData)).rejects.toThrow(
        '이메일 또는 비밀번호가 올바르지 않습니다.',
      );
    });
  });

  describe('getUserById', () => {
    it('존재하지 않는 사용자 조회 시 에러를 발생시킨다', async () => {
      // Given
      const userId = 'non-existent-user-id';
      mockPrismaUser.findUnique.mockResolvedValue(null);

      // When & Then
      await expect(getUserById(userId)).rejects.toThrow(
        '사용자를 찾을 수 없습니다.',
      );
    });
  });
});
