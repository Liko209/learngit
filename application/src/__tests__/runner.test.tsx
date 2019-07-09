/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-06-27 11:53:57
 * Copyright © RingCentral. All rights reserved.
 */

describe('JSDOM Runner', () => {
  it('should have window object', () => {
    expect(window).toBe(global);
  });
});
