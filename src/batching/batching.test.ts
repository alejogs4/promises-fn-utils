import { createBatchedPromise } from './batching';

describe('Batching test', () => {
  const uniqueParam = 'same';

  test('Should call just once the function if it is called with the same parameter', async () => {
    const fn = jest.fn().mockResolvedValue(1);
    const batchedFunction = createBatchedPromise(fn);

    const firstCall = batchedFunction(uniqueParam);
    const secondCall = batchedFunction(uniqueParam);

    const firstValue = await firstCall;
    const secondValue = await secondCall;

    expect(firstValue).toBe(1);
    expect(secondValue).toBe(1);

    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith(uniqueParam);
  });

  test('Should call function again with same params if old call has completed', async () => {
    const fn = jest.fn().mockResolvedValue(1);
    const batchedFunction = createBatchedPromise(fn);

    await batchedFunction(uniqueParam);
    await batchedFunction(uniqueParam);

    expect(fn).toHaveBeenCalledTimes(2);
  });

  test('Should call function several times if different params are being used', async () => {
    const fn = jest.fn().mockResolvedValue(1);
    const batchedFunction = createBatchedPromise(fn);

    const firstCall = batchedFunction('1');
    const secondCall = batchedFunction('2');

    await firstCall;
    await secondCall;

    expect(fn).toHaveBeenCalledTimes(2);
  });
});
