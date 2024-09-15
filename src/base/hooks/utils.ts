import { useRef, useState } from "react";
import { defer } from "lodash-es";

export const useStatic = <T>(initializer: () => T) => {
  const [data] = useState(initializer);
  return data;
};

export const useOnce = (action: () => void) => {
  useStatic(() => {
    defer(() => {
      action();
    });
  });
};

export const useRefFrom = <T>(source: T) => {
  const ref = useRef(source);
  ref.current = source;
  return ref;
}

export const useCurrentFn = <A extends unknown[], R>(fn: (...args: A) => R) => {
  const fnRef = useRefFrom(fn);
  return (...args: A) => fnRef.current(...args);
}
