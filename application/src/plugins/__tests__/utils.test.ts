/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-09-18 10:08:42
 * Copyright © RingCentral. All rights reserved.
 */
import { createFunctionWrapDecorator } from '../utils';

describe('utils', () => {
  describe('createFunctionWrapDecorator()', () => {
    it('should work', () => {
      const before = jest.fn().mockName('before');
      const after = jest.fn().mockName('after');
      const foo = createFunctionWrapDecorator({
        before,
        after,
      });

      class Bar {
        @foo
        fn(str1: string, str: string) {}
      }

      const bar = new Bar();
      bar.fn('Hey', 'Yo');

      expect(before).toHaveBeenCalledWith(bar, ['Hey', 'Yo']);
      expect(after).toHaveBeenCalledWith(bar, ['Hey', 'Yo']);
    });
  });
});
