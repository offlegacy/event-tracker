"use client";

import Image from "next/image";
import { useTheme } from "nextra-theme-docs";

import { useSystemDarkMode } from "./useSystemDarkMode";

interface LogoProps {
  size?: number;
}

const DARK_LOGO_PATH = "/img/dark-logo.png";
const LIGHT_LOGO_PATH = "/img/light-logo.png";

export const Logo = ({ size = 30 }: LogoProps) => {
  const isSystemDarkMode = useSystemDarkMode();
  const { theme } = useTheme();

  const isDarkMode = theme === "system" ? isSystemDarkMode : theme === "dark";

  return (
    <Image src={isDarkMode ? DARK_LOGO_PATH : LIGHT_LOGO_PATH} alt="event-tracker logo" width={size} height={size} />
  );
};
