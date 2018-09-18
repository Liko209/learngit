/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-09-18 10:07:39
 * Copyright © RingCentral. All rights reserved.
 */
type FunctionDecoratorOptions = {
  install(
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ): PropertyDescriptor;
  beforeInstall?(
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ): PropertyDescriptor;
  afterInstall?(
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ): PropertyDescriptor;
};

type FunctionWrapDecoratorOptions = {
  beforeInstall?(
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ): PropertyDescriptor;
  afterInstall?(
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ): PropertyDescriptor;
  before?(...args: any[]): void;
  after?(...args: any[]): void;
};

function createFunctionDecorator(options: FunctionDecoratorOptions) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    // Before decorator apply
    options.beforeInstall &&
      options.beforeInstall.apply(null, [target, propertyKey, descriptor]);

    options.install.apply(null, [target, propertyKey, descriptor]);

    // After decorator apply
    options.afterInstall &&
      options.afterInstall.apply(null, [target, propertyKey, descriptor]);

    return descriptor;
  };
}

function createFunctionWrapDecorator({
  beforeInstall,
  afterInstall,
  ...options
}: FunctionWrapDecoratorOptions) {
  return createFunctionDecorator({
    beforeInstall,
    afterInstall,
    install(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
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
    },
  });
}

export { createFunctionDecorator, createFunctionWrapDecorator };
