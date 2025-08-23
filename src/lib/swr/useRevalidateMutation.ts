import { useSWRConfig } from "swr";

export default function useRevalidateMutation() {
  const { cache, mutate } = useSWRConfig();
  return (matcher: RegExp) => {
    if (!(cache instanceof Map)) {
      throw new Error(
        "matchMutate requires the cache provider to be a Map instance"
      );
    }

    const keys = [];

    for (const key of cache.keys()) {
      if (matcher.test(key)) {
        keys.push(key);
      }
    }

    const mutations = keys.map((key) => mutate(key));
    return Promise.all(mutations);
  };
}
