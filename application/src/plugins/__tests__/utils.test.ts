/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-09-18 10:08:42
 * Copyright © RingCentral. All rights reserved.
 */
import { createFunctionDecorator, createFunctionWrapDecorator } from '../utils';

describe('utils', () => {
  describe('createFunctionDecorator()', () => {
    let Bar;
    let beforeInstall;
    let afterInstall;

    beforeEach(() => {
      jest.clearAllMocks();
      beforeInstall = jest.fn().mockName('beforeInstall');
      afterInstall = jest.fn().mockName('afterInstall');
      const uppercase = createFunctionDecorator({
        beforeInstall,
        afterInstall,
        install(
          target: any,
          propertyKey: string,
          descriptor: PropertyDescriptor,
        ) {
          const originalFn = descriptor.value;
          descriptor.value = function (...args: any[]) {
            return originalFn.apply(this, args).toUpperCase();
          };
          return descriptor;
        },
      });

      class ClsBar {
        @uppercase
        hello(str: string) {
          return `Hello ${str}`;
        }
      }

      Bar = ClsBar;
    });

    it('should work', () => {
      const bar = new Bar();
      const result = bar.hello('World');
      expect(result).toBe('HELLO WORLD');
    });

    it('should have beforeInstall/afterInstall hooks', () => {
      new Bar();
      expect(beforeInstall).toHaveBeenCalled();
      expect(afterInstall).toHaveBeenCalled();
    });
  });

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
