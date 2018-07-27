interface Newable<T> {
  new (...args: any[]): T;
}

type InjectableName < T > = Newable<T> | string | Function;
type Injectable = Newable<any> | Function | Object;

interface InjectableConfig {
  name: InjectableName<any>;
  value: Injectable;
  type?: string;
  injects?: InjectableName<any>[];
  singleton?: boolean;
}

interface ContainerConfig {
  singleton?: boolean;
}

function isInjectableConfig(config: any): config is InjectableConfig {
  return !!(config as InjectableConfig).value;
}

function normalizeConfig(config: InjectableConfig | Newable<any>): InjectableConfig {
  if (isInjectableConfig(config)) {
    if (!config.type) config.type = 'class';
    return config;
  } else {
    return {
      name: config,
      value: config,
      type: 'class'
    };
  }
}

class Container {
  private _containerConfig: ContainerConfig;
  private _registerMap = new Map<InjectableName<any>, InjectableConfig>();
  private _singletonMap = new Map<InjectableName<any>, any>();

  constructor(containerConfig?: ContainerConfig) {
    this._containerConfig = containerConfig || {};
    this.register({
      name: Container.name,
      type: 'object',
      value: this,
      singleton: true
    });
  }

  registerAll(configs: (InjectableConfig | Newable<any>)[]) {
    configs.forEach(config => this.register(config));
  }

  register<T>(config: InjectableConfig | Newable<any>): void {
    const normalizedConfig = normalizeConfig(config);
    this.validConfig(normalizedConfig);
    this._registerMap.set(normalizedConfig.name, normalizedConfig);
  }

  validConfig(config: InjectableConfig) {
    if (config.type === 'class' && !config.value.constructor) {
      throw new Error(`${config.name} can not be registered as a class. Please check if it is a real Class?`);
    }
  }
  get<T>(name: InjectableName<T>): T {
    const config = this._registerMap.get(name);
    if (!config) throw new Error(`${name} not been registered.`);

    return this._createInstance<T>(config);
  }

  private _createInstance<T>(config: InjectableConfig) {
    let instance = null;
    let injectables: any[] = [];
    const isSingleton = this._containerConfig.singleton || config.singleton;

    if (isSingleton) {
      instance = this._singletonMap.get(config.name);
      if (instance) return instance;
    }

    if (config.injects) {
      injectables = config.injects.map(inject => this.get(inject));
    }

    if (config.type === 'class') {
      // register as class
      const Class = config.value as Newable<any>;
      instance = new Class(...injectables);
    } else {
      // register as Function/object
      instance = config.value;
    }

    if (isSingleton) {
      this._singletonMap.set(config.name, instance);
    }

    return instance;
  }
}

export { Container, InjectableName, Injectable, InjectableConfig, ContainerConfig };
