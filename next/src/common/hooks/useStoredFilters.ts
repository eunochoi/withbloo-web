import { useCurrentUser } from './useCurrentUser';
import { useLocalStorage } from './useLocalStorage';

type FilterView = 'feed' | 'habit' | 'sober' | 'home-analysis' | 'feed-stats';

export function useStoredFilters<T>(view: FilterView, defaults: T) {
  const { data: user } = useCurrentUser();
  return useLocalStorage(user ? `took:${user.id}:filter:${view}` : null, defaults);
}
