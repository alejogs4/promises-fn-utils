import { FunctionPromiseIdentity, PromiseFn, PromiseLikeReturnType } from '../types';
import { wait } from './retryUtils';

type RetryPolicyOption<ErrorObject> = {
  retries: number;
  retryTime: number;
  retryFactor?: number;
  shouldRetry?: (error: ErrorObject) => boolean;
};

function createRetryPolicy<ErrorObject>(retryPolicyOptions: RetryPolicyOption<ErrorObject>) {
  const { retries, retryTime, retryFactor = 2, shouldRetry = () => true } = retryPolicyOptions;

  return function applyRetryPolicy<Fn extends PromiseFn>(fn: PromiseFn): FunctionPromiseIdentity<Fn> {
    return async (...args: Parameters<Fn>): Promise<PromiseLikeReturnType<Fn>> => {
      let currentRetries = 0;
      let currentRetryTime = retryTime;

      return (async function executeRetry(...args: Parameters<Fn>): Promise<PromiseLikeReturnType<Fn>> {
        try {
          const result = await fn(...args);
          return result;
        } catch (error) {
          if (shouldRetry(error as ErrorObject) && currentRetries + 1 <= retries) {
            currentRetries++;

            await wait(currentRetryTime);
            currentRetryTime = currentRetryTime * retryFactor;
            return executeRetry(...args);
          }

          throw error;
        }
      })(...args);
    };
  };
}

export { createRetryPolicy };
