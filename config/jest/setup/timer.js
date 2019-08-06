const timerIds = [];
const intervalIds = [];
const { wrapFunction } = require('../../utils');

const setup = () => {
  const wrapSetTimeout = wrapFunction(global.setTimeout, {
    after: (id, cb, timeout) => {
      timerIds.push(id);
      return id;
    },
  });
  const wrapSetInterval = wrapFunction(global.setInterval, {
    after: (id, cb, timeout) => {
      intervalIds.push(id);
      return id;
    },
  });
  Object.defineProperty(global, 'setTimeout', {
    value: wrapSetTimeout,
    writable: true,
  });
  Object.defineProperty(window, 'setTimeout', {
    value: wrapSetTimeout,
    writable: true,
  });
  Object.defineProperty(global, 'setInterval', {
    value: wrapSetInterval,
    writable: true,
  });
  Object.defineProperty(window, 'setInterval', {
    value: wrapSetInterval,
    writable: true,
  });
};

setup();

const tearDown = () => {
  timerIds.forEach(id => {
    clearTimeout(id);
  });
  intervalIds.forEach(id => {
    clearInterval(id);
  });
};

export { setup, tearDown };
