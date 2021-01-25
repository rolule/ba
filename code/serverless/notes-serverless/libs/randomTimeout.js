export const randomTimeout = (onResolve) => {
  const randomTime = 50;

  return new Promise((resolve, reject) =>
    setTimeout(() => {
      resolve(randomTime);
    }, randomTime)
  );
};
