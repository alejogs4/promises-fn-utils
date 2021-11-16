/* eslint-disable no-import-assign */
import { createRetryPolicy } from './retry';
import * as retryUtils from './retryUtils';

jest.mock('./retryUtils.ts');

afterEach(() => {
  jest.clearAllMocks();
});

describe('Retry policy tests', () => {
  test('Should retry as many times as is specified', async () => {
    const fn = jest
      .fn()
      .mockRejectedValueOnce({})
      .mockRejectedValueOnce({})
      .mockRejectedValueOnce({})
      .mockResolvedValueOnce(1);
    const applyRetryPolicy = createRetryPolicy({ retries: 3, retryTime: 0 });
    const retriedFn = applyRetryPolicy(fn);

    const result = await retriedFn();
    expect(result).toBe(1);
    expect(fn).toHaveBeenCalledTimes(4);
  });

  test('Should fail after all retries has been made and fails again', async () => {
    const errObj = { message: 'This is the error message' };
    const fn = jest
      .fn()
      .mockRejectedValueOnce(errObj)
      .mockRejectedValueOnce(errObj)
      .mockRejectedValueOnce(errObj)
      .mockResolvedValueOnce(1);

    const applyRetryPolicy = createRetryPolicy({ retries: 2, retryTime: 0 });
    const retriedFn = applyRetryPolicy(fn);

    try {
      await retriedFn();
      throw new Error('This should have failed');
    } catch (err) {
      expect(err).toEqual(errObj);
      expect(fn).toHaveBeenCalledTimes(3);
    }
  });

  test('Should stop trying and fails if shouldRetry returns false', async () => {
    const fineErrObj = { message: 'This is the error message' };
    const wrongErrObj = { message: 'This is a wrong error message' };
    const fn = jest.fn().mockRejectedValueOnce(fineErrObj).mockRejectedValueOnce(wrongErrObj).mockResolvedValueOnce(1);
    const applyRetryPolicy = createRetryPolicy<typeof fineErrObj>({
      retries: 3,
      retryTime: 0,
      shouldRetry: (err) => err.message === fineErrObj.message,
    });
    const retriedFn = applyRetryPolicy(fn);

    try {
      await retriedFn();
      throw new Error('This should have failed');
    } catch (err) {
      expect(err).toEqual(wrongErrObj);
      expect(fn).toHaveBeenCalledTimes(2);
    }
  });

  test('Should wait required intervals applying the interval factor which by default is 2(exponential backoff)', async () => {
    const fn = jest
      .fn()
      .mockRejectedValueOnce({})
      .mockRejectedValueOnce({})
      .mockRejectedValueOnce({})
      .mockResolvedValueOnce(1);
    const applyRetryPolicy = createRetryPolicy({
      retries: 3,
      retryTime: 400,
      retryFactor: 2,
    });

    // @ts-ignore
    retryUtils.wait = jest.fn().mockImplementation(async () => {});
    const retriedFn = applyRetryPolicy(fn);
    const result = await retriedFn();

    expect(retryUtils.wait).toHaveBeenCalledTimes(3);
    expect(retryUtils.wait).toHaveBeenNthCalledWith(1, 400);
    expect(retryUtils.wait).toHaveBeenNthCalledWith(2, 800);
    expect(retryUtils.wait).toHaveBeenNthCalledWith(3, 1600);
    expect(result).toBe(1);
  });
});
