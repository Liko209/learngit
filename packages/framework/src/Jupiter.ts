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
  inject,
} from './ioc';
import { ModuleConfig, Provide } from './types';
import { ModuleManager } from './ModuleManager';

/**
 * Jupiter Framework
 */
@injectable()
class Jupiter {
  private _running = false;
  private _moduleEntries: interfaces.Newable<AbstractModule>[] = [];
  private _container: Container = container;
  private _asyncModulePromises: Promise<void>[] = [];
  @inject(ModuleManager) _moduleManager: ModuleManager;

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
        console.log(
          '--- %c async module run bootstrap',
          'background-color: yellow',
          entry,
        );
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
    console.log('--- %c container bind:', 'background-color: red;', identifier);
    this._container.bind(identifier).to(creator);
    this._moduleManager.identifiersMap.set(identifier, null);
  }

  unbindProvide<T>(provide: Provide<T>) {
    const { identifier } = this._parseProvide(provide);
    console.log(
      '--- %c container unbind:',
      'background-color: green;',
      identifier,
    );
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
    console.log(
      '--- %c before bootstrapModule check isBound and start run bootstrap: ',
      'background-color: green;',
      this._container.isBound(moduleEntry),
      moduleEntry,
    );
    const m = this._container.get<AbstractModule>(moduleEntry);
    await m.bootstrap();

    if (afterBootstrap) {
      await afterBootstrap();
    }
  }

  async bootstrap() {
    console.log('---- jupiter bootstrap');
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
}

container.bind<Jupiter>(Jupiter).to(Jupiter);

export { Jupiter };
