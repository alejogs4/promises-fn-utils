import { PromiseLikeReturnType } from './PromiseLikeReturnType';

type FunctionGeneralForm = (...args: any[]) => any;
type FunctionPromiseIdentity<Fn extends FunctionGeneralForm> = (
  ...args: Parameters<Fn>
) => Promise<PromiseLikeReturnType<Fn>>;

export { FunctionPromiseIdentity };
