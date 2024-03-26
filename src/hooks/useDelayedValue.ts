import { useEffect, useState } from "react";
import equal from "fast-deep-equal/react";

export const useDelayedValue = <T>(val: T, delayMs: number) => {
  const [data, setData] = useState(val);

  const enqueueChange = () => {
    setTimeout(() => {
      setData(val);
    }, delayMs);
  };

  useEffect(() => {
    const isSame = equal(val, data);
    if (!isSame) enqueueChange();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [val]);

  return data;
};
