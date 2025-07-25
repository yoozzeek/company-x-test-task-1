import { z } from 'zod';

export const registerDto = z.object({
  email: z.email(),
  password: z.string().min(6),
});

export const loginDto = z.object({
  email: z.email(),
  password: z.string(),
});

export type RegisterDto = z.infer<typeof registerDto>;
export type LoginDto = z.infer<typeof loginDto>;
