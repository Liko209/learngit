/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-09-18 10:07:22
 * Copyright © RingCentral. All rights reserved.
 */
import { AbstractViewModel } from '../AbstractViewModel';

class MyViewModel extends AbstractViewModel {}

describe('AbstractViewModel', () => {
  it('should work', () => {
    const vm = new MyViewModel();
    expect(vm).toBeInstanceOf(AbstractViewModel);
  });

  describe('extendProps()', () => {
    it('should add new property in vm', () => {
      const vm = new MyViewModel();
      vm.extendProps({
        foo: 'bar',
      });
      expect(vm).toHaveProperty('foo', 'bar');
    });
  });
});
