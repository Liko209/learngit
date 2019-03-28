/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-01-07 10:31:32
 * Copyright © RingCentral. All rights reserved.
 */
import getDecorators from 'inversify-inject-decorators';
import { AbstractModule } from './AbstractModule';
import {
  METADATA_KEY,
  Container,
  decorate,
  injectable,
  interfaces,
} from './ioc';
import { ModuleConfig, Provide } from './types';

/**
 * Jupiter Framework
 */
@injectable()
class Jupiter {
  private _running = false;
  private _moduleEntries: interfaces.Newable<AbstractModule>[] = [];
  private _container: Container = container;
  private _asyncModulePromises: Promise<void>[] = [];

  registerModule(
    { provides, entry }: ModuleConfig,
    afterBootstrap?: () => void,
  ): void {
    provides && this.bindProvides(provides);
    if (entry) {
      this.bindProvide(entry);
      this.addEntry(entry);
      if (this._running) {
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

  addEntry(m: interfaces.Newable<AbstractModule>) {
    this._moduleEntries.push(m);
  }

  bindProvides(provides: ModuleConfig['provides'] = []) {
    provides.forEach((provide: Provide<any>) => {
      this.bindProvide(provide);
    });
  }

  bindProvide<T>(provide: Provide<T>) {
    const hasNameValue = (
      provide: any,
    ): provide is {
      name: string | interfaces.Newable<T>;
      value: interfaces.Newable<T>;
    } => {
      return !!provide.value;
    };

    let identifier;
    let constructor;

    if (hasNameValue(provide)) {
      identifier = provide.name;
      constructor = provide.value;
    } else {
      identifier = provide;
      constructor = provide;
    }

    if (!Reflect.hasOwnMetadata(METADATA_KEY.PARAM_TYPES, constructor)) {
      decorate(injectable(), constructor);
    }
    this._container.bind(identifier).to(constructor);
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
}

const container = new Container({
  defaultScope: 'Singleton',
  skipBaseClassChecks: true,
});

container.bind<Jupiter>(Jupiter).to(Jupiter);
const {
  lazyInject,
  lazyInjectNamed,
  lazyInjectTagged,
  lazyMultiInject,
} = getDecorators(container, false);

export {
  Jupiter,
  container,
  lazyInject,
  lazyInjectNamed,
  lazyInjectTagged,
  lazyMultiInject,
};
