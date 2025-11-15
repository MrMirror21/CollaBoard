import bcrypt from 'bcrypt';

interface AuthUser {
  id: string;
  email: string;
  name: string;
}

interface AuthPrismaClient {
  user: {
    findUnique: (args: {
      where: { email: string };
    }) => Promise<AuthUser | null>;
    create: (args: {
      data: { email: string; password: string; name: string };
      select: { id: true; email: true; name: true };
    }) => Promise<AuthUser>;
  };
}

export class AuthService {
  constructor(private prisma: AuthPrismaClient) {}

  async register(
    email: string,
    password: string,
    // eslint-disable-next-line @stylistic/comma-dangle
    name: string
  ): Promise<AuthUser> {
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new Error('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    return this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });
  }
}
