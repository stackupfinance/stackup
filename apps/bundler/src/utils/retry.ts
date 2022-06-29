const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const retryWithDelay = async (
  fn: () => Promise<boolean>,
  delay: number,
  attempts: number,
  count = 0
): Promise<void> => {
  const isDone = await fn();

  if (!isDone && count < attempts) {
    await sleep(delay);
    return retryWithDelay(fn, delay, attempts, count + 1);
  }
};
