import { FunctionPromiseIdentity, PromiseFn, PromiseLikeReturnType } from '../types';

type CacheOptions = {
  ttl?: number;
  maxEntries?: number;
};

function createCache(options: CacheOptions) {
  const { ttl, maxEntries = 15 } = options;
  return function wrapPromiseWithCache<Fn extends PromiseFn>(fn: Fn): FunctionPromiseIdentity<Fn> {
    type FunctionReturnType = PromiseLikeReturnType<Fn>;

    let cache: Record<string, FunctionReturnType> = {};
    // eslint-disable-next-line no-undef
    let ttlTimeoutID: NodeJS.Timeout;
    const clearCache = () => {
      cache = {};
    };
    return async (...args: Parameters<Fn>): Promise<FunctionReturnType> => {
      if (ttl) {
        clearTimeout(ttlTimeoutID);
        ttlTimeoutID = setTimeout(clearCache, ttl);
      }

      const cacheKey = args.reduce((cacheKey, arg) => `${cacheKey}-${JSON.stringify(arg)}`, '');
      if (cacheKey in cache) {
        return cache[cacheKey];
      }

      const result = await fn(...args);
      if (Object.keys(cache).length === maxEntries) clearCache();
      cache[cacheKey] = result;

      return result;
    };
  };
}

export { createCache };
