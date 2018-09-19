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
        result.then(() => {
          options.after && options.after.apply(this, [this, args]);
        });
      } else {
        options.after && options.after.apply(this, [this, args]);
      }

      return result;
    };
    return descriptor;
  };
}

function createLoadingStateDecorator<VM extends IViewModel>(
  loading: string,
  delay = 500,
) {
  const loadingFinished = `${loading}_finished`;

  function setLoading(vm: VM) {
    if (vm[loadingFinished]) return;
    vm[loading] = true;
  }

  function setLoadingFinished(vm: VM) {
    vm[loading] = false;
    vm[loadingFinished] = true;
  }

  return createFunctionWrapDecorator({
    before(vm: VM) {
      setTimeout(() => setLoading(vm), delay);
    },
    after(vm: VM) {
      setLoadingFinished(vm);
    },
  });
}

export { createFunctionWrapDecorator, createLoadingStateDecorator };
