import { useLayoutEffect } from "react";
import { useMedia } from "react-use";

export const useDark = () => {
    const preferDark = useMedia('(prefers-color-scheme: dark)', false);
    const dark = preferDark;

    useLayoutEffect(() => {
        const body = document.body;
        if (dark) {
            if (!body.hasAttribute('theme-mode')) {
                body.setAttribute('theme-mode', 'dark');
            }
        } else {
            if (body.hasAttribute('theme-mode')) {
                body.removeAttribute('theme-mode');
            }
        }
    }, [dark]);

    return dark;
}
