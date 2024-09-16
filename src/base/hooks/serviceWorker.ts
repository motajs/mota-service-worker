import { useEffect, useMemo, useState } from "react";
import { useOnce } from "./utils";
import { usePromiseValue } from "./async";

export const useServiceWorker = (path: string, options?: RegistrationOptions) => {
  useOnce(() => {
    window.navigator.serviceWorker.register(path, options);
  });

  const [controller, setController] = useState(navigator.serviceWorker.controller);

  useEffect(() => {
    const onControllerChange = () => {
      setController(navigator.serviceWorker.controller);
    }
    navigator.serviceWorker.addEventListener("controllerchange", onControllerChange);
    return () => navigator.serviceWorker.removeEventListener("controllerchange", onControllerChange);
  }, []);

  const controllerReady = useMemo(() => navigator.serviceWorker.ready, []);

  const [registration, isReady] = usePromiseValue(controllerReady);

  return {
    controller,
    registration,
    ready: controllerReady,
    isReady,
  };
}
