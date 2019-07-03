/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-06-27 10:08:01
 * Copyright © RingCentral. All rights reserved.
 */
global.console.error = message => {
  throw message instanceof Error ? message : new Error(message);
};

global.console.warn = message => {
  throw message;
};
