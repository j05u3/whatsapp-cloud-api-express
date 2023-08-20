export const sleep = function (ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
};
