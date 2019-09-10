/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-06-27 10:08:01
 * Copyright © RingCentral. All rights reserved.
 */
const rawConsoleError = console.error;
const rawConsoleWarn = console.warn;
if (!process.env.JUI_TEST) {
  const whiteList = [
    /Warning: Material-UI:/,
    /When testing, code that causes React state updates should be wrapped into act/,
  ];

  global.console.error = (message, ...args) => {
    if (whiteList.find(reg => reg.test(message))) {
      return;
    }
    rawConsoleError.apply(console, [message, ...args]);
    if (process.env.IT) {
      return;
    }
    throw message instanceof Error ? message : new Error(message);
  };

  global.console.warn = (message, ...args) => {
    if (whiteList.find(reg => reg.test(message))) {
      return;
    }
    rawConsoleWarn.apply(console, [message, ...args]);
    if (process.env.IT) {
      return;
    }
    throw message;
  };
}
