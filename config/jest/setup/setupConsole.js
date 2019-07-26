/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-06-27 10:08:01
 * Copyright © RingCentral. All rights reserved.
 */

if (!process.env.JUI_TEST) {
  const whiteList = [
    /Warning: Material-UI:/
  ];

  global.console.error = message => {
    if (whiteList.find(reg => reg.test(message))) {
      return;
    }
    throw message instanceof Error ? message : new Error(message);
  };

  global.console.warn = message => {
    if (whiteList.find(reg => reg.test(message))) {
      return;
    }
    throw message;
  };
}
