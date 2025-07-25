import { z } from 'zod';

export const usersListDto = z.array(
  z.object({
    id: z.number(),
    email: z.email(),
  })
);
