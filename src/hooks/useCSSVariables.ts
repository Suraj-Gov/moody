import { useEffect } from "react";

export const useCSSVariables = (val: Record<`--${string}`, string>) => {
  useEffect(() => {
    Object.entries(val).forEach(([k, v]) => {
      document.documentElement.style.setProperty(k, v);
    });
  }, [val]);
};
