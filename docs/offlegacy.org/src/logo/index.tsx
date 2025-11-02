"use client";

import Image from "next/image";
import { useTheme } from "nextra-theme-docs";
import { useLayoutEffect, useState } from "react";

interface LogoProps {
  size?: number;
}

const DARK_LOGO_PATH = "/img/dark-logo.png";
const LIGHT_LOGO_PATH = "/img/light-logo.png";

export const Logo = ({ size = 30 }: LogoProps) => {
  const { resolvedTheme } = useTheme();
  const [src, setSrc] = useState(LIGHT_LOGO_PATH);

  useLayoutEffect(() => {
    setSrc(resolvedTheme === "dark" ? DARK_LOGO_PATH : LIGHT_LOGO_PATH);
  }, [resolvedTheme]);

  return <Image src={src} alt="event-tracker logo" width={size} height={size} />;
};
