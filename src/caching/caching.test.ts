import { createCache } from './caching';

afterEach(() => {
  jest.clearAllTimers();
});

jest.useFakeTimers();

describe('Caching decorator tests', () => {
  test('Should call a function only once if has been called before hand with the same parameters', async () => {
    const applyCacheSetup = createCache();
    const mockFn = jest.fn().mockResolvedValue(1);
    const cachedFn = applyCacheSetup(mockFn);

    let result = await cachedFn('one', 'two');
    result = await cachedFn('one', 'two');

    expect(mockFn).toBeCalledTimes(1);
    expect(mockFn).toBeCalledWith('one', 'two');
    expect(result).toBe(1);
  });

  test('Should clean cache after a given ttl', async () => {
    const ttl = 60000;
    const applyCacheSetup = createCache({ ttl });
    const mockFn = jest.fn().mockResolvedValue(1);
    const cachedFn = applyCacheSetup(mockFn);

    await cachedFn('one', 'two');
    await cachedFn('one', 'two');
    expect(mockFn).toBeCalledTimes(1);

    jest.advanceTimersByTime(ttl);
    await cachedFn('one', 'two');
    expect(mockFn).toBeCalledTimes(2);
  });

  test('Should clean cache after a max entry has been reached', async () => {
    const applyCacheSetup = createCache({ maxEntries: 2 });
    const mockFn = jest.fn().mockResolvedValue(1);
    const cachedFn = applyCacheSetup(mockFn);

    await cachedFn('one', 'two');
    await cachedFn('one', 'two');
    expect(mockFn).toBeCalledTimes(1);

    await cachedFn('two', 'three');
    expect(mockFn).toBeCalledTimes(2);

    await cachedFn('three', 'four');
    expect(mockFn).toBeCalledTimes(3);

    await cachedFn('one', 'two');
    expect(mockFn).toBeCalledTimes(4);
  });
});
