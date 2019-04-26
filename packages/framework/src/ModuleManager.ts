import { injectable, Container, container, interfaces } from './ioc';

@injectable()
class ModuleManager {
  private _container: Container = container;
  // prettier-ignore
  private _initializedListenerMap = new Map<interfaces.ServiceIdentifier<any>[], any[]>();
  // prettier-ignore
  private _disposedListenerMap = new Map<interfaces.ServiceIdentifier<any>[], any[]>();

  identifiersMap = new Map();

  emitModuleInitial(identifier: interfaces.ServiceIdentifier<any>) {
    console.log(`---[ModuleManager]: emitModuleInitial ${identifier} is emit.`);
    // 1. find this identifier 关联的 listener, check are initialized?
    // 1.1 not
    // 1,2 have
    const filterListenerKeys = this._findInitializedListenerKeyByIdentifier(
      identifier,
    );

    filterListenerKeys.forEach(key => {
      const areModulesInitialized = this._areModulesBound(key);
      console.log(
        '---[ModuleManager]: areModulesInitialized:',
        key,
        areModulesInitialized,
      );

      if (areModulesInitialized) {
        this._executeModulesInitialCallback(key);
      } else {
        return null;
      }
    });
  }

  emitModuleDispose(identifier: interfaces.ServiceIdentifier<any>) {
    console.log(
      `---[ModuleManager Dispose]: emitModuleDispose ${identifier} is emit.`,
    );
    const filterListenerKeys = this._findDisposedListenerKeyByIdentifier(
      identifier,
    );

    console.log(
      '---[ModuleManager Dispose]: emitModuleDispose',
      filterListenerKeys,
    );

    filterListenerKeys.forEach(key => {
      const areModulesUnBound = this._areModulesUnBound(key);
      console.log(
        '---[ModuleManager Dispose]: areModulesUnBound:',
        key,
        areModulesUnBound,
      );

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
    callback: (...args) => void,
  ) {
    let identifiers: interfaces.ServiceIdentifier<T>[] = [];

    identifiers = !Array.isArray(identifier) ? [identifier] : identifier;

    // 1. check identifier modules are initialized?
    // 1.1 loaded => callback
    // 1.2 unloaded => add unloaded module initialized listener.
    const areIdentifierModuleInitialized = this._areModulesBound(identifiers);

    if (areIdentifierModuleInitialized) {
      console.log(
        `---[ModuleManager]: identifier ${identifiers} is initialized.`,
      );
      const identifierModules = this._getModulesByIdentifier(identifiers);
      callback.apply(null, identifierModules);
      console.log(`---[ModuleManager]: ${identifiers} callback be called`);
    } else {
      console.log(
        `---[ModuleManager]: identifier ${identifiers} not initialized.`,
      );
      this._addModulesInitializedListener(identifiers, callback);
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

    // 1. check identifier modules are unbound?
    const areModulesUnBound = this._areModulesUnBound(identifiers);
    const areModulesBoundBefore = this._areModulesBoundBefore(identifiers);

    if (areModulesUnBound && areModulesBoundBefore) {
      // 1.1 are unbound
      console.log(
        `---[ModuleManager Dispose]: identifier ${identifiers} are unBound.`,
      );
      callback();
    } else {
      console.log(
        `---[ModuleManager Dispose]: addModulesDisposedListener ${identifiers}`,
      );
      this._addModulesDisposedListener(identifiers, callback);
    }
  }

  private _areModulesBoundBefore<T>(
    identifiers: interfaces.ServiceIdentifier<T>[],
  ) {
    const identifiersLength = identifiers.length;
    if (identifiersLength === 0) {
      return false;
    }
    for (let i = 0; i < identifiersLength; i++) {
      if (!this.identifiersMap.has(identifiers)) {
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

  private _findInitializedListenerKeyByIdentifier<T>(
    identifiers: interfaces.ServiceIdentifier<T>,
  ) {
    const listenerKey = [];
    for (const key of this._initializedListenerMap.keys()) {
      if (key.includes(identifiers)) {
        listenerKey.push(key);
      }
    }
    return listenerKey;
  }

  private _findDisposedListenerKeyByIdentifier<T>(
    identifiers: interfaces.ServiceIdentifier<T>,
  ) {
    const listenerKey = [];
    for (const key of this._disposedListenerMap.keys()) {
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
        console.log('---[ModuleManager]: identifier not Bound', identifiers[i]);
        return false;
      }
    }
    return true;
  }

  private _getModulesByIdentifier<T>(
    identifiers: interfaces.ServiceIdentifier<T>[],
  ) {
    const modules = [];
    identifiers.forEach(i => {
      modules.push(this._container.get(i));
    });
    return modules;
  }

  private _addModulesInitializedListener<T>(
    identifiers: interfaces.ServiceIdentifier<T>[],
    callback: (...args) => void,
  ) {
    // 1. check have same modules listener?
    // 1.1 have => add callback
    // 1.1 haven't => create callback holder for identifiers
    if (this._initializedListenerMap.has(identifiers)) {
      const callbacks = this._initializedListenerMap.get(identifiers);
      callbacks && callbacks.push(callback);
    } else {
      this._initializedListenerMap.set(identifiers, [callback]);
    }
    console.log(
      '---[ModuleManager]: add ModulesInitializedListener',
      this._initializedListenerMap,
    );
  }

  private _addModulesDisposedListener<T>(
    identifiers: interfaces.ServiceIdentifier<T>[],
    callback: () => void,
  ) {
    if (this._disposedListenerMap.has(identifiers)) {
      const callbacks = this._disposedListenerMap.get(identifiers);
      callbacks && callbacks.push(callback);
    } else {
      this._disposedListenerMap.set(identifiers, [callback]);
    }
    console.log(
      '---[ModuleManager Dispose]: add ModulesDisposedListener',
      this._disposedListenerMap,
    );
  }
}

container.bind<ModuleManager>(ModuleManager).to(ModuleManager);

export { ModuleManager };
