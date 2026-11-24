import { useRouter } from "next/navigation";
import { useEffect } from "react";

export const usePrefetchPage = () => {
  const router = useRouter();

  useEffect(() => {
    router.prefetch('/diary');
    router.prefetch('/feed');
    router.prefetch('/habit');
    router.prefetch('/setting');
  }, [router]);
};
