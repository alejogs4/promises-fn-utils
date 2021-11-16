import { FunctionPromiseIdentity, PromiseFn, PromiseLikeReturnType } from '../types';

type VoidPromise = () => Promise<void>;

function queuingTask<Fn extends PromiseFn>(fn: Fn): FunctionPromiseIdentity<Fn> {
  const queue: VoidPromise[] = [];
  let running = false;

  return function run(...params: Parameters<Fn>): Promise<PromiseLikeReturnType<Fn>> {
    return new Promise((resolve, reject) => {
      const toRun = () =>
        fn(...params)
          .then(resolve)
          .catch(reject);
      queue.push(toRun);

      if (!running) {
        (function execute() {
          const onlyRunning = queue.shift();
          if (onlyRunning) {
            onlyRunning().then(() => {
              running = false;
              execute();
            });
            running = true;
          }
        })();
      }
    });
  };
}

export { queuingTask };
