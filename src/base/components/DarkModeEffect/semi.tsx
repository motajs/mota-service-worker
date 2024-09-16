import { DarkModeStore } from "@/base/store/darkMode";
import { FC, useLayoutEffect } from "react";

const DarkModeEffectSemi: FC = () => {

  const { isDarkMode } = DarkModeStore.useStore();

  useLayoutEffect(() => {
    const body = document.body;
    if (isDarkMode) {
      if (!body.hasAttribute('theme-mode')) {
        body.setAttribute('theme-mode', 'dark');
      }
    } else {
      if (body.hasAttribute('theme-mode')) {
        body.removeAttribute('theme-mode');
      }
    }
  }, [isDarkMode]);

  return null;
}

export default DarkModeEffectSemi;
