import React, { useState, useEffect, useRef } from 'react';

interface CountdownTimerBadgeProps {
  initialSeconds: number;
  isPaused?: boolean;
  isRefreshing?: boolean;
  onTimeout: () => void;
  resetTrigger?: any;
  render: (seconds: number) => React.ReactNode;
}

/**
 * Isolated countdown component that keeps the 1-second state tick
 * localized to this element only, preventing expensive root components
 * from re-rendering every second.
 */
export const CountdownTimerBadge: React.FC<CountdownTimerBadgeProps> = React.memo(({
  initialSeconds,
  isPaused = false,
  isRefreshing = false,
  onTimeout,
  resetTrigger,
  render
}) => {
  const [seconds, setSeconds] = useState<number>(initialSeconds);
  const onTimeoutRef = useRef(onTimeout);
  onTimeoutRef.current = onTimeout;

  // Reset countdown when trigger changes (e.g. manual refresh or tab change)
  useEffect(() => {
    setSeconds(initialSeconds);
  }, [resetTrigger, initialSeconds]);

  // Handle countdown tick
  useEffect(() => {
    if (isPaused || isRefreshing) return;

    const timer = setInterval(() => {
      setSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [isPaused, isRefreshing]);

  // When timer reaches 0, safely trigger onTimeout in an effect (not during state reduction)
  useEffect(() => {
    if (seconds === 0 && !isRefreshing && !isPaused) {
      setSeconds(initialSeconds);
      onTimeoutRef.current();
    }
  }, [seconds, initialSeconds, isRefreshing, isPaused]);

  return <>{render(seconds)}</>;
});
