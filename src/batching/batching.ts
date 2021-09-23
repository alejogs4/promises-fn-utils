import { FunctionPromiseIdentity, PromiseFn, PromiseLikeReturnType } from '../types';

function createBatchedPromise<Fn extends PromiseFn>(fn: Fn): FunctionPromiseIdentity<Fn> {
  const batchedCalls: Record<string, Promise<PromiseLikeReturnType<Fn>>> = {};
  return async (...args: Parameters<Fn>): Promise<PromiseLikeReturnType<Fn>> => {
    const key = args.reduce((key, arg) => `${key}-${arg}`, '');
    if (key in batchedCalls) {
      const result = await batchedCalls[key];
      return result;
    }

    const resultPromise = fn(...args).finally(() => {
      delete batchedCalls[key];
    });
    batchedCalls[key] = resultPromise;
    return resultPromise;
  };
}

export { createBatchedPromise };
