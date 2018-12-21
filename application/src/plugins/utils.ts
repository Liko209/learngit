/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-09-18 10:07:39
 * Copyright © RingCentral. All rights reserved.
 */
import { IViewModel } from '@/base';

type FunctionWrapDecoratorOptions = {
  before?(...args: any[]): void;
  after?(...args: any[]): void;
};

function createFunctionWrapDecorator(options: FunctionWrapDecoratorOptions) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalFn = descriptor.value;
    descriptor.value = function (...args: any[]) {
      // Before function call
      options.before && options.before.apply(this, [this, args]);

      const result = originalFn.apply(this, args);

      // After function call
      if (result instanceof Promise) {
        // originalFn is async
        return result.then((data: any) => {
          options.after && options.after.apply(this, [this, args]);
          return data;
        });
      }
      // originalFn is sync
      options.after && options.after.apply(this, [this, args]);
      return result;
    };
    return descriptor;
  };
}

function createLoadingStateDecorator<VM extends IViewModel>(loading: string) {
  return createFunctionWrapDecorator({
    before(vm: VM) {
      vm[loading] = true;
    },
    after(vm: VM) {
      vm[loading] = false;
    },
  });
}

export { createFunctionWrapDecorator, createLoadingStateDecorator };
