const timerIds = [];
const intervalIds = [];
const { wrapFunction } = require('../../utils');

const setup = () => {
  Object.defineProperty(global, 'setTimeout', {
    value: wrapFunction(global.setTimeout, {
      after: (id, cb, timeout) => {
        timerIds.push(id);
        return id;
      },
    }),
    writable: true,
  });
  Object.defineProperty(global, 'setInterval', {
    value: wrapFunction(global.setInterval, {
      after: (id, cb, timeout) => {
        intervalIds.push(id);
        return id;
      },
    }),
    writable: true,
  });
};

setup();

const tearDown = () => {
  // console.log('TCL: tearDown -> tearDown', timerIds.length);
  timerIds.forEach(id => {
    clearTimeout(id);
  });
  intervalIds.forEach(id => {
    clearInterval(id);
  });
};

export { setup, tearDown };
