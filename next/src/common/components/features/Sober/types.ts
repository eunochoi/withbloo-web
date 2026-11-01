import type { Prisma } from '@prisma/client';
export type SoberWithRestarts = Prisma.SoberGetPayload<{ include: { restarts: true } }>;
