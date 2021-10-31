import { FunctionPromiseIdentity, PromiseFn, PromiseLikeReturnType } from '../types';

type JustOnceFn<Fn extends PromiseFn> = FunctionPromiseIdentity<Fn> & {
  reset: () => void;
};

function justOnce<Fn extends PromiseFn>(fn: Fn): JustOnceFn<Fn> {
  let isAlreadyExecuted = false;
  let returnedValue: PromiseLikeReturnType<Fn> | null = null;

  async function execute(...args: Parameters<Fn>): Promise<PromiseLikeReturnType<Fn>> {
    if (isAlreadyExecuted) return returnedValue as PromiseLikeReturnType<Fn>;
    returnedValue = await fn(...args);
    isAlreadyExecuted = true;

    return returnedValue as PromiseLikeReturnType<Fn>;
  }

  execute.reset = () => {
    isAlreadyExecuted = false;
    returnedValue = null;
  };

  return execute;
}

export { justOnce };
