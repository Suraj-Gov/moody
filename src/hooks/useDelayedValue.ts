import { useEffect, useState } from "react";

export const useDelayedValue = <T>(val: T, delayMs: number) => {
  const [data, setData] = useState(val);

  useEffect(() => {
    setTimeout(() => {
      setData(val);
    }, delayMs);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [val]);

  return data;
};
