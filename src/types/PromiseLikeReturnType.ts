type PromiseLikeReturnType<Fn extends Function> = Fn extends (...args: any[]) => Promise<infer AsyncValue>
  ? AsyncValue
  : never;

export { PromiseLikeReturnType };
