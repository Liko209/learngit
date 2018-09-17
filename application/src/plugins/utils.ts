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
      descriptor.value = async function (...args: any[]) {
        // Before function call
        options.before && options.before.apply(this, [args]);

        await originalFn.apply(this, args);

        // After function call
        options.after && options.after.apply(this, [args]);
      };
      return descriptor;
    },
  });
}

export { createFunctionDecorator, createFunctionWrapDecorator };
