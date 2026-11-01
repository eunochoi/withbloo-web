import { getTodayStringInUserTimezone } from '@/common/utils/date/userTimezone';
import HomePage from './_components/HomePage';

const HomeLoading = async () => {
  const initialDate = await getTodayStringInUserTimezone();
  return <HomePage initialDate={initialDate} loading />;
};

export default HomeLoading;
