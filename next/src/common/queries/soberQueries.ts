import { getSobers } from '@/common/actions/sober';
import type { QueryActionRunner } from './queryAction';

export const soberQueries = {
  list: (run: QueryActionRunner) => ({ queryKey: ['sober'] as const, queryFn: () => run(getSobers) }),
};
