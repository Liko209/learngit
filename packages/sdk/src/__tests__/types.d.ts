/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-05-21 15:35:35
 * Copyright © RingCentral. All rights reserved.
 */
/* eslint-disable */
declare global {
  interface Function extends jest.MockInstance<any, any> {}
}

// Just export something useless to make this file importable.
declare const useless = 0;
export { useless };
