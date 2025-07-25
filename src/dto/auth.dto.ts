import { z } from 'zod';

export const RegisterDto = z.object({
  email: z.email(),
  password: z.string().min(6),
});

export const LoginDto = z.object({
  email: z.email(),
  password: z.string(),
});

export type RegisterDtoType = z.infer<typeof RegisterDto>;
export type LoginDtoType = z.infer<typeof LoginDto>;
