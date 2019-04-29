/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-01-07 10:31:32
 * Copyright © RingCentral. All rights reserved.
 */
import { AbstractModule } from './AbstractModule';
import {
  METADATA_KEY,
  Container,
  container,
  decorate,
  injectable,
  interfaces,
} from './ioc';
import { ModuleConfig, Provide, LISTENER_TYPE } from './types';

/**
 * Jupiter Framework
 */
@injectable()
class Jupiter {
  private _running = false;
  private _moduleEntries: interfaces.Newable<AbstractModule>[] = [];
  private _container: Container = container;
  private _asyncModulePromises: Promise<void>[] = [];
  private _identifiersMap = new Map();
  // prettier-ignore
  private _initializedListenerMap = new Map<interfaces.ServiceIdentifier<any>[], any[]>();
  // prettier-ignore
  private _disposedListenerMap = new Map<interfaces.ServiceIdentifier<any>[], any[]>();

  registerModule(
    { provides, entry }: ModuleConfig,
    afterBootstrap?: () => void,
  ): void {
    if (provides) {
      provides.forEach((provide: Provide<any>) => {
        this.bindProvide(provide);
      });
    }

    if (entry) {
      this.bindProvide(entry);
      this.addEntry(entry);
      if (this._running) {
        // async module
        this.bootstrapModule(entry, afterBootstrap);
      }
    }
  }

  registerModuleAsync(
    loader: () => Promise<{ config: ModuleConfig }>,
    afterBootstrap?: () => void,
  ) {
    const promise = loader().then(m =>
      this.registerModule(m.config, afterBootstrap),
    );
    this._asyncModulePromises.push(promise);
    return promise;
  }

  async unRegisterModule(
    { provides, entry }: ModuleConfig,
    afterDispose?: () => void | Promise<void>,
  ) {
    if (provides) {
      provides.forEach((provide: Provide<any>) => {
        this.unbindProvide(provide);
      });
    }

    if (entry) {
      const m = this._container.get<AbstractModule>(entry);
      m.dispose && (await m.dispose());
      this._container.unbind(entry);
    }

    afterDispose && (await afterDispose());
  }

  addEntry(m: interfaces.Newable<AbstractModule>) {
    this._moduleEntries.push(m);
  }

  private _parseProvide<T>(provide: Provide<T>) {
    const hasNameValue = (
      provide: any,
    ): provide is {
      name: string | interfaces.Newable<T>;
      value: interfaces.Newable<T>;
    } => {
      return !!provide.value;
    };

    let identifier;
    let creator;

    if (hasNameValue(provide)) {
      identifier = provide.name;
      creator = provide.value;
    } else {
      identifier = provide;
      creator = provide;
    }

    return { identifier, creator };
  }

  bindProvide<T>(provide: Provide<T>) {
    const { identifier, creator } = this._parseProvide(provide);

    if (!Reflect.hasOwnMetadata(METADATA_KEY.PARAM_TYPES, creator)) {
      decorate(injectable(), creator);
    }

    this._container.bind(identifier).to(creator);
    this._identifiersMap.set(identifier, null);
  }

  unbindProvide<T>(provide: Provide<T>) {
    const { identifier } = this._parseProvide(provide);

    this._container.unbind(identifier);
  }

  get<T>(
    name: string | symbol | interfaces.Newable<T> | interfaces.Abstract<T>,
  ) {
    return this._container.get<T>(name);
  }

  async bootstrapModule<T extends AbstractModule>(
    moduleEntry: interfaces.ServiceIdentifier<T>,
    afterBootstrap?: () => void | Promise<void>,
  ) {
    const m = this._container.get<AbstractModule>(moduleEntry);
    await m.bootstrap();

    if (afterBootstrap) {
      await afterBootstrap();
    }
  }

  async bootstrap() {
    if (this._running) {
      throw new Error('Jupiter already running.');
    }

    if (this._asyncModulePromises.length > 0) {
      await Promise.all(this._asyncModulePromises);
    }

    await Promise.all(
      this._moduleEntries.map(
        (moduleEntry: interfaces.ServiceIdentifier<AbstractModule>) => {
          this.bootstrapModule(moduleEntry);
        },
      ),
    );

    this._running = true;
  }

  emitModuleInitial(identifier: interfaces.ServiceIdentifier<any>) {
    const filterListenerKeys = this._findListenerKeyByIdentifier(
      identifier,
      LISTENER_TYPE.INITIALIZED,
    );

    filterListenerKeys.forEach(key => {
      const areModulesInitialized = this._areModulesBound(key);
      if (areModulesInitialized) {
        this._executeModulesInitialCallback(key);
      } else {
        return null;
      }
    });
  }

  emitModuleDispose(identifier: interfaces.ServiceIdentifier<any>) {
    const filterListenerKeys = this._findListenerKeyByIdentifier(
      identifier,
      LISTENER_TYPE.DISPOSED,
    );

    filterListenerKeys.forEach(key => {
      const areModulesUnBound = this._areModulesUnBound(key);
      if (areModulesUnBound) {
        this._executeModulesDisposeCallback(key);
      } else {
        return null;
      }
    });
  }

  onInitialized<T>(
    identifier:
      | interfaces.ServiceIdentifier<T>
      | interfaces.ServiceIdentifier<T>[],
    callback: (...args: any[]) => void,
  ) {
    let identifiers: interfaces.ServiceIdentifier<T>[] = [];

    identifiers = !Array.isArray(identifier) ? [identifier] : identifier;

    const areIdentifierModuleInitialized = this._areModulesBound(identifiers);

    if (areIdentifierModuleInitialized) {
      const identifierModules = this._getModulesByIdentifier(identifiers);
      callback.apply(null, identifierModules);
    } else {
      this._addModulesListener(
        identifiers,
        callback,
        LISTENER_TYPE.INITIALIZED,
      );
    }
  }

  onDisposed<T>(
    identifier:
      | interfaces.ServiceIdentifier<T>
      | interfaces.ServiceIdentifier<T>[],
    callback: () => void,
  ) {
    let identifiers: interfaces.ServiceIdentifier<T>[] = [];

    identifiers = !Array.isArray(identifier) ? [identifier] : identifier;

    const areModulesUnBound = this._areModulesUnBound(identifiers);
    const areModulesBoundBefore = this._areModulesBoundBefore(identifiers);

    if (areModulesUnBound && areModulesBoundBefore) {
      callback();
    } else {
      this._addModulesListener(identifiers, callback, LISTENER_TYPE.DISPOSED);
    }
  }

  getModulesListenerByType(listenerType: LISTENER_TYPE) {
    const listenerMap =
      listenerType === LISTENER_TYPE.INITIALIZED
        ? this._initializedListenerMap
        : this._disposedListenerMap;
    return listenerMap;
  }

  private _areModulesBoundBefore<T>(
    identifiers: interfaces.ServiceIdentifier<T>[],
  ) {
    const identifiersLength = identifiers.length;
    if (identifiersLength === 0) {
      return false;
    }
    for (let i = 0; i < identifiersLength; i++) {
      if (!this._identifiersMap.has(identifiers[i])) {
        return false;
      }
    }
    return true;
  }

  private _areModulesUnBound<T>(
    identifiers: interfaces.ServiceIdentifier<T>[],
  ) {
    const identifiersLength = identifiers.length;
    if (identifiersLength === 0) {
      return true;
    }
    for (let i = 0; i < identifiersLength; i++) {
      if (this._container.isBound(identifiers[i])) {
        return false;
      }
    }
    return true;
  }

  private _executeModulesInitialCallback<T>(
    identifiers: interfaces.ServiceIdentifier<T>[],
  ) {
    const callbacks = this._initializedListenerMap.get(identifiers);
    if (callbacks && callbacks.length !== 0) {
      const module = this._getModulesByIdentifier(identifiers);
      callbacks.forEach((cb, idx) => {
        cb && cb.apply(null, module);
        callbacks.splice(idx, 1);
      });
    }
  }

  private _executeModulesDisposeCallback<T>(
    identifiers: interfaces.ServiceIdentifier<T>[],
  ) {
    const callbacks = this._disposedListenerMap.get(identifiers);
    if (callbacks && callbacks.length !== 0) {
      callbacks.forEach((cb, idx) => {
        cb && cb();
        callbacks.splice(idx, 1);
      });
    }
  }

  private _findListenerKeyByIdentifier<T>(
    identifiers: interfaces.ServiceIdentifier<T>,
    listenerType: LISTENER_TYPE,
  ) {
    const listenerKey = [];
    const listenerMap = this.getModulesListenerByType(listenerType);
    for (const key of listenerMap.keys()) {
      if (key.includes(identifiers)) {
        listenerKey.push(key);
      }
    }
    return listenerKey;
  }

  private _areModulesBound<T>(
    identifiers: interfaces.ServiceIdentifier<T>[],
  ): boolean {
    const identifiersLength = identifiers.length;
    if (identifiersLength === 0) {
      return false;
    }
    for (let i = 0; i < identifiersLength; i++) {
      if (!this._container.isBound(identifiers[i])) {
        return false;
      }
    }
    return true;
  }

  private _getModulesByIdentifier<T>(
    identifiers: interfaces.ServiceIdentifier<T>[],
  ) {
    const modules: interfaces.Newable<T>[] = [];
    identifiers.forEach(i => {
      modules.push(this._container.get(i));
    });
    return modules;
  }

  private _addModulesListener<T>(
    identifiers: interfaces.ServiceIdentifier<T>[],
    callback: (...args: any[]) => void,
    listenerType: LISTENER_TYPE,
  ) {
    const listenerMap = this.getModulesListenerByType(listenerType);

    if (listenerMap.has(identifiers)) {
      const callbacks = listenerMap.get(identifiers);
      callbacks && callbacks.push(callback);
    } else {
      listenerMap.set(identifiers, [callback]);
    }
  }
}

container.bind<Jupiter>(Jupiter).to(Jupiter);

export { Jupiter };
