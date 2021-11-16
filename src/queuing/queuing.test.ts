import { queuingTask } from './queuing';

const delayFn = (ms: number, fn: Function) =>
  new Promise((resolve) =>
    setTimeout(async () => {
      const val = await fn(ms);
      resolve(val);
    }, ms),
  );

describe('queuing task tests', () => {
  test('Should ensure the order incoming function calls will be processed', async () => {
    const fn = jest.fn().mockImplementation(async () => {});
    const queuedDelay = queuingTask(delayFn);

    // This in terms of testing should not be done since we don't want to add real delay to our tests, but is key to test our functionality
    await Promise.all([queuedDelay(100, fn), queuedDelay(50, fn), queuedDelay(200, fn)]);

    expect(fn).toHaveBeenCalledTimes(3);
    expect(fn).toHaveBeenNthCalledWith(1, 100);
    expect(fn).toHaveBeenNthCalledWith(2, 50);
    expect(fn).toHaveBeenNthCalledWith(3, 200);
  });

  test.skip('Should queue just the max amount of specified calls', async () => {
    const fn = jest.fn().mockImplementation(async () => {});
    // @ts-ignore
    const queuedDelay = queuingTask(delayFn, { maxQueueSize: 2 });

    await Promise.all([queuedDelay(100, fn), queuedDelay(50, fn), queuedDelay(200, fn)]);

    expect(fn).toHaveBeenCalledTimes(2);
    expect(fn).toHaveBeenNthCalledWith(1, 100);
    expect(fn).toHaveBeenNthCalledWith(2, 50);
    expect(fn).not.toHaveBeenNthCalledWith(3, 200);
  });
});
