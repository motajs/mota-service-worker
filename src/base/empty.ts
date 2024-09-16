export const EMPTY = Symbol("EMPTY");

export const noop: () => void = () => void 0;
export const asyncNoop = () => Promise.resolve();
