import { useEffect, useState } from "react";

const DARK_MODE_QUERY = "(prefers-color-scheme: dark)";

export const useSystemDarkMode = () => {
  const [isSystemDarkMode, setIsSystemDarkMode] = useState(false);

  useEffect(() => {
    const matchMedia = window.matchMedia(DARK_MODE_QUERY);
    setIsSystemDarkMode(matchMedia.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setIsSystemDarkMode(e.matches);
    };

    matchMedia.addEventListener("change", handleChange);

    return () => {
      matchMedia.removeEventListener("change", handleChange);
    };
  }, []);

  return isSystemDarkMode;
};
