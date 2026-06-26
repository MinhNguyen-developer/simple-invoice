import { describe, it, expect, beforeEach } from '@jest/globals';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service.js';

describe('AuthService', () => {
  let service: AuthService;
  let mockPrisma: any;
  let mockJwtService: any;

  beforeEach(() => {
    mockPrisma = { user: { findUnique: async () => null } };
    mockJwtService = { sign: () => 'mock-jwt-token' };
    service = new (AuthService as any)(mockPrisma, mockJwtService);
  });

  describe('login', () => {
    it('throws UnauthorizedException when user is not found', async () => {
      mockPrisma.user.findUnique = async () => null;
      await expect(
        service.login({ email: 'notfound@test.com', password: 'password' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException when password is incorrect', async () => {
      mockPrisma.user.findUnique = async () => ({
        id: 'user-1',
        email: 'user@test.com',
        passwordHash:
          '$2b$10$invalidddddddddddddddddddddddddddddddddddddddddddddddd',
        fullname: 'Test User',
      });
      await expect(
        service.login({ email: 'user@test.com', password: 'wrongpassword' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
