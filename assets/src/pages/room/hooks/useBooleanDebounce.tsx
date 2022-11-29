import { useEffect, useState } from "react";

export const useBooleanDebounce = (value: boolean, risingEdgeDelay: number, fallingEdgeDelay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const delay = value ? risingEdgeDelay : fallingEdgeDelay;

    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, risingEdgeDelay, fallingEdgeDelay]);

  return debouncedValue;
};
