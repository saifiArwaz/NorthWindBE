import { prisma } from "../../config/prisma.config.js";
import bcrypt from "bcrypt";
import { Role } from "../../generated/prisma/enums.js";
import { signAccessToken, signRefreshToken } from "../../utils/token.utils.js";
import { ENV } from "../../config/env.config..js";
import { ApiError } from "../../utils/apiError.utils.js";

const SALT_ROUNDS = 10;

export async function registerUser(data: {
  name?: string;
  email: string;
  password: string;
  role?: Role;
}) {
  const existing = await prisma.user.findUnique({
    where: { email: data.email },
  });
  if (existing) throw new Error("Email already exists");

  const hashed = await bcrypt.hash(data.password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      email: data.email,
      name: data.name,
      password: hashed,
      role: data.role?.toUpperCase() as Role,
    },
  });
}

export async function loginUser(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new ApiError(404, "User not found");

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) throw new Error("Password incorrect");

  const accessToken = signAccessToken({ id: user.id, role: user.role });
  const refreshToken = signRefreshToken({ id: user.id });

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + ENV.REFRESH_TOKEN_EXPIRY_MS), // ✅ from env
    },
  });

  return {
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
    accessToken,
    refreshToken,
  };
}
