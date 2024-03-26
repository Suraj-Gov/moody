import { useEffect } from "react";

export const useCSSVariables = (
  args: {
    val: Record<`--${string}`, string>;
    nodes?: (Partial<HTMLElement> | null)[];
  },
  dependencyArray: unknown[]
) => {
  const { nodes = [document.documentElement], val } = args;

  useEffect(() => {
    nodes.forEach((n) => {
      Object.entries(val).forEach(([k, v]) => {
        n?.style?.setProperty(k, v);
      });
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dependencyArray, nodes]);
};
