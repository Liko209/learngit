interface INewable<T> {
  new(...args: any[]): T;
}

interface IAsyncNewable<T> {
  (...args: any[]): Promise<any>;
}

type InjectableName<T> = INewable<T> | string | Function;
type Injectable = INewable<any> | Function | Object;

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

interface IProvider {
  (...args: any[]): ((...args: any[]) => Promise<any>) | Promise<any>;
}

interface IClassConfig extends InjectableConfig {
  value: INewable<any>;
}

interface IAsyncClassConfig extends InjectableConfig {
  value: IAsyncNewable<any>;
}

interface IProviderConfig<T> extends InjectableConfig {
  value: IProvider;
}

interface IConstantConfig extends InjectableConfig {
  value: Object;
}

interface IRegisterConfig {
  type: RegisterType;
  cache?: any;
  implementationType?: INewable<any>;
  asyncImplementationType?: IAsyncNewable<any>;
  provider?: IProvider;
  singleton?: boolean;
  async?: boolean;
  injects?: InjectableName<any>[];
}

interface IContainerConfig {
  singleton?: boolean;
}

export {
  InjectableName,
  Injectable,
  InjectableConfig,
  IContainerConfig,
  IClassConfig,
  IAsyncClassConfig,
  IProviderConfig,
  IConstantConfig,
  IRegisterConfig,
  RegisterType,
  INewable,
  IAsyncNewable,
};
