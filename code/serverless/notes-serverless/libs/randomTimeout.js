export const randomTimeout = (onResolve) => {
  const randomTime = 2000;

  return new Promise((resolve, reject) =>
    setTimeout(() => {
      resolve(randomTime);
    }, randomTime)
  );
};
