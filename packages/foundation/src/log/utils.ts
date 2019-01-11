
const MAX_INTEGER = 9007199254740992;

function randomInt(): number {
  return Math.floor(Math.random() * MAX_INTEGER);
}

function sleep(timeout: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, timeout);
  });
}

export {
  randomInt,
  sleep,
};
