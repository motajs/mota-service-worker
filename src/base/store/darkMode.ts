import { useLocalStorage, useMedia } from "react-use";
import { createStore } from "./store";

export const DarkModeStore = createStore(() => {
  const systemPreference = useMedia("(prefers-color-scheme: dark)", false);
  const [userConfig = systemPreference, setUserConfig] = useLocalStorage("dark-mode");

  const isDarkMode = userConfig ?? systemPreference;

  return {
    isDarkMode,
    setIsDarkMode: setUserConfig,
  };
});
