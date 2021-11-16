import { justOnce } from './justOnce';

describe('justOnce tests', () => {
  test('Should run the fn once no matter how many times is called', async () => {
    const returnedValue = 1;
    const fn = jest.fn().mockResolvedValue(returnedValue);
    const onceFn = justOnce(fn);

    let returned = await onceFn();
    returned = await onceFn();
    returned = await onceFn();
    returned = await onceFn();
    returned = await onceFn();
    returned = await onceFn();

    expect(fn).toHaveBeenCalledTimes(1);
    expect(returned).toBe(returnedValue);

    onceFn.reset();

    returned = await onceFn();
    returned = await onceFn();
    returned = await onceFn();
    returned = await onceFn();
    returned = await onceFn();

    expect(fn).toHaveBeenCalledTimes(2);
    expect(returned).toBe(returnedValue);
  });
});
