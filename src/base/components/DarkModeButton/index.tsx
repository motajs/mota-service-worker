import { FC } from "react";
import { Button } from "@douyinfe/semi-ui";
import { ButtonProps } from "@douyinfe/semi-ui/lib/es/button";
import { IconMoon, IconSun } from "@douyinfe/semi-icons";
import { DarkModeStore } from "@/base/store/darkMode";

export interface IDarkModeButtonProps extends ButtonProps {
  
}

const DarkModeButton: FC<IDarkModeButtonProps> = (props) => {
  const { isDarkMode, setIsDarkMode } = DarkModeStore.useStore();

  return (
    <Button
      type="tertiary"
      icon={isDarkMode ? <IconMoon /> : <IconSun />}
      onClick={() => {
        setIsDarkMode(!isDarkMode);
      }}
      {...props}
    />
  );
}

export default DarkModeButton;
