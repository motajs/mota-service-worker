import { useMemo, useState } from "react"

export const usePromiseValue = <T>(promise: Promise<T>) => {
    const [result, setResult] = useState<[undefined, false] | [T, true]>([void 0, false]);
    useMemo(() => {
        setResult([void 0, false]);
        promise.then((value) => {
            setResult([value, true]);
        });
    }, [promise]);
    return result;
}
