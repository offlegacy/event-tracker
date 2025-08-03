export const isFunction = <Args = unknown, Return = unknown>(value: unknown): value is (...args: Args[]) => Return => {
  return typeof value === "function";
};
