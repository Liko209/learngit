/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-06-27 10:08:01
 * Copyright © RingCentral. All rights reserved.
 */
global.console.info = jest.fn();
global.console.log = jest.fn();
const rawConsoleError = console.error;
const blackList = [
  /When testing, code that causes React state updates should be wrapped into act/,
];
global.console.error = (arg1, ...args) => {
  if (
    Object.prototype.toString.call(arg1) === '[object String]' &&
    !!blackList.find(reg => reg.test(arg1))
  ) {
    return;
  }
  rawConsoleError.apply(console, [arg1, ...args]);
};
// global.console = {
//   assert: jest.fn(),
//   clear: jest.fn(),
//   context: jest.fn(),
//   count: jest.fn(),
//   countReset: jest.fn(),
//   debug: jest.fn(),
//   // error: message => {
//   //   throw message instanceof Error ? message : new Error(message);
//   // },
//   group: jest.fn(),
//   groupCollapsed: jest.fn(),
//   groupEnd: jest.fn(),
//   info: jest.fn(),
//   log: jest.fn(),
//   time: jest.fn(),
//   timeEnd: jest.fn(),
//   timeLog: jest.fn(),
//   timeStamp: jest.fn(),
//   trace: jest.fn(),
//   warn: message => {
//     throw message;
//   },
// };
