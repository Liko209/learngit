/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-03-12 14:59:44
 * Copyright © RingCentral. All rights reserved.
 */

describe('Node Runner', () => {
  it('should not have window object', () => {
    expect(() => window).toThrow();
  });
});
