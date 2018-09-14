type FunctionWrapOptions = {
  before(...args: any[]): void;
  after(...args: any[]): void;
};

function createFunctionWrapDecorator(options: FunctionWrapOptions) {
  return function (target: any, propertyKey: string, descriptor: any) {
    const originalFn = descriptor.value;
    descriptor.value = async function (...args: any[]) {
      options.before && options.before.apply(this, [this, args]);
      await originalFn.apply(this, args);
      options.after && options.after.apply(this, [this, args]);
    };
    return descriptor;
  };
}

export { createFunctionWrapDecorator };
