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

class Container {
  private _containerConfig: ContainerConfig;
  private _registrationMap = new Map<InjectableName<any>, RegisterConfig>();

  constructor(containerConfig?: ContainerConfig) {
    this._containerConfig = containerConfig || {};
    this.registerConstantValue({
      name: Container.name,
      value: this,
    });
  }

  registerClass<T>(config: ClassConfig): void {
    const registration: RegisterConfig = {
      type: RegisterType.Instance,
      implementationType: config.value,
      singleton: config.singleton,
      injects: config.injects,
    };
    this._registrationMap.set(config.name, registration);
  }

  registerAsyncClass(config: AsyncClassConfig): void {
    const registration: RegisterConfig = {
      type: RegisterType.Instance,
      asyncImplementationType: config.value,
      singleton: config.singleton,
      injects: config.injects,
      async: true,
    };
    this._registrationMap.set(config.name, registration);
  }

  registerProvider<T>(config: ProviderConfig<T>) {
    const registration: RegisterConfig = {
      type: RegisterType.Provider,
      provider: config.value,
      async: config.async,
      injects: config.injects,
    };
    this._registrationMap.set(config.name, registration);
  }

  registerConstantValue(config: ConstantConfig) {
    const registration: RegisterConfig = {
      type: RegisterType.ConstantValue,
      cache: config.value,
      async: config.async,
      injects: config.injects,
    };
    this._registrationMap.set(config.name, registration);
  }

  get<T>(name: InjectableName<T>): T {
    const registration = this.getRegistration(name);

    if (registration.async) throw new Error(`${name} is async, use asyncGet() to get it.`);

    const cache = this.getCache(registration);
    if (cache) return cache;

    const injections = this.getInjections(registration.injects);
    const result = this.resolve<T>(registration, injections);
    this.setCache(registration, result);
    return result;
  }

  async asyncGet<T>(name: InjectableName<T>): Promise<T> {
    const registration = this.getRegistration(name);

    const cache = this.getCache(registration);
    if (cache) return cache;

    const injections = await this.asyncGetInjections(registration.injects);
    const result = await this.asyncResolve<T>(registration, injections);
    this.setCache(registration, result);

    return result;
  }

  isAsync(name: InjectableName<any>): boolean {
    return !!this.getRegistration(name).async;
  }

  getRegistration(name: InjectableName<any>): RegisterConfig {
    const config = this._registrationMap.get(name);
    if (!config) throw new Error(`${name} not been registered.`);
    return config;
  }

  private getCache(registration: RegisterConfig) {
    const isSingleton = this._containerConfig.singleton || registration.singleton;

    if (isSingleton && registration.cache) {
      return registration.cache;
    }
  }

  private setCache(registration: RegisterConfig, result: any) {
    const isSingleton = this._containerConfig.singleton || registration.singleton;

    if (isSingleton) {
      registration.cache = result;
    }
  }

  private resolve<T>(registration: RegisterConfig, injections: Injectable[]): T {
    let result: any = null;

    if (registration.type === RegisterType.ConstantValue) {
      result = registration.cache;
    } else if (registration.type === RegisterType.Instance && registration.implementationType) {
      result = this.resolveInstance<T>(registration.implementationType, injections);
    } else if (registration.type === RegisterType.Provider && registration.provider) {
      result = registration.provider();
    } else {
      throw new Error(`Can not get ${name}`);
    }

    return result;
  }

  private async asyncResolve<T>(
    registration: RegisterConfig,
    injections: Injectable[],
  ): Promise<T> {

    let result: any = null;

    if (registration.type === RegisterType.Instance &&
      registration.async &&
      registration.asyncImplementationType) {
      result = this.asyncResolveInstance(name, registration.asyncImplementationType, injections);
    } else {
      result = this.resolve<T>(registration, injections);
    }

    return result;
  }

  private getInjections(names?: InjectableName<any>[]): any[] {
    if (!names) return [];
    return names.map(name => this.get(name));
  }

  private async asyncGetInjections(names?: InjectableName<any>[]): Promise<any[]> {
    if (!names) return [];
    return Promise.all(names.map(name => this.asyncGet(name)));
  }

  private resolveInstance<T>(creator: Newable<T>, injections: any[]): any {
    let instance = null;

    const Class = creator as Newable<any>;
    instance = new Class(...injections);

    return instance;
  }

  private async asyncResolveInstance(
    name: InjectableName<any>,
    getModule: (...args: any[]) => Promise<any>,
    injections: any[],
  ): Promise<any> {
    const module = await getModule();
    const creator = module[name.toString()] || module.default;
    return this.resolveInstance(creator, injections);
  }
}

export { Container, InjectableName, Injectable, InjectableConfig, ContainerConfig };
