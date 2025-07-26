import { z } from 'zod';

export const usersListDto = z.array(
  z.object({
    id: z.string(),
    email: z.email(),
  })
);
