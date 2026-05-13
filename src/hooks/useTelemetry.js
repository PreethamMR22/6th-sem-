import { useEffect } from 'react';
import { useStore } from '../store/useStore';

export const useTelemetry = () => {
  const updateTelemetry = useStore((state) => state.updateTelemetry);

  useEffect(() => {
    const interval = setInterval(() => {
      updateTelemetry();
    }, 2000);

    return () => clearInterval(interval);
  }, [updateTelemetry]);
};
