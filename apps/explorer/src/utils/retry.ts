const MAX_DELAY = 600;
const BASE_DELAY = 5;

export const exponentialBackoffDelay = (attempt: number) => {
  // This function returns a delay value that starts at $BASE_DELAY seconds
  // and exponentially increases to a cap of $MAX_DELAY seconds with full jitter.
  return `${Math.round(
    Math.random() * Math.min(MAX_DELAY, BASE_DELAY * 2 ** attempt)
  )} seconds`;
};
