export const wait = (delayMs: number) =>
  new Promise((resolve) => setTimeout(resolve, delayMs));
