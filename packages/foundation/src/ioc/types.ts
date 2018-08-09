interface Newable<T> {
  new(...args: any[]): T;
}

interface AsyncNewable<T> {
  (...args: any[]): Promise<any>;
}

type InjectableName<T> = Newable<T> | string | Function;
type Injectable = Newable<any> | Function | Object;

enum RegisterType {
  ConstantValue = 'ConstantValue',
  Constructor = 'Constructor',
  DynamicValue = 'DynamicValue',
  Factory = 'Factory',
  Function = 'Function',
  Instance = 'Instance',
  Invalid = 'Invalid',
  Provider = 'Provider',
}

interface InjectableConfig {
  name: InjectableName<any>;
  value: Injectable;
  injects?: InjectableName<any>[];
  async?: boolean;
  singleton?: boolean;
}

interface Provider {
  (...args: any[]): ((...args: any[]) => Promise<any>) | Promise<any>;
}

interface ClassConfig extends InjectableConfig {
  value: Newable<any>;
}

interface AsyncClassConfig extends InjectableConfig {
  value: AsyncNewable<any>;
}

interface ProviderConfig<T> extends InjectableConfig {
  value: Provider;
}

interface ConstantConfig extends InjectableConfig {
  value: Object;
}

interface RegisterConfig {
  type: RegisterType;
  cache?: any;
  implementationType?: Newable<any>;
  asyncImplementationType?: AsyncNewable<any>;
  provider?: Provider;
  singleton?: boolean;
  async?: boolean;
  injects?: InjectableName<any>[];
}

interface ContainerConfig {
  singleton?: boolean;
}

export {
  InjectableName,
  Injectable,
  InjectableConfig,
  ContainerConfig,
  ClassConfig,
  AsyncClassConfig,
  ProviderConfig,
  ConstantConfig,
  RegisterConfig,
  RegisterType,
  Newable,
  AsyncNewable,
};
