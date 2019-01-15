/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-01-07 10:31:32
 * Copyright © RingCentral. All rights reserved.
 */
import { AbstractModule } from './AbstractModule';
import { Container, container, decorate, injectable, interfaces } from './ioc';
import { ModuleConfig } from './types';

/**
 * Jupiter Framework
 */
class Jupiter {
  private _running = false;
  private _moduleEntries: interfaces.Newable<AbstractModule>[] = [];
  private _container: Container = container;
  private _asyncModulePromises: Promise<void>[] = [];

  registerModule({ provides, entry }: ModuleConfig): void {
    provides && this.bindProvides(provides);
    if (entry) {
      this.bindProvide(entry);
      this.addEntry(entry);
      if (this._running) {
        this.bootstrapModule(entry);
      }
    }
  }

  registerModuleAsync(moduleName: string) {
    const promise = import(`@/modules/${moduleName}/module.config`).then(
      electron => this.registerModule(electron.config),
    );
    this._asyncModulePromises.push(promise);
  }

  addEntry(m: interfaces.Newable<AbstractModule>) {
    this._moduleEntries.push(m);
  }

  bindProvides(provides: ModuleConfig['provides'] = {}) {
    Object.keys(provides).forEach((key: string) => {
      this.bindProvide(provides[key]);
    });
  }

  bindProvide(provide: interfaces.Newable<AbstractModule>) {
    decorate(injectable(), provide);
    this._container.bind(provide).to(provide);
  }

  async bootstrapModule<T extends AbstractModule>(
    moduleEntry: interfaces.ServiceIdentifier<T>,
  ) {
    const m = this._container.get<AbstractModule>(moduleEntry);
    await m.bootstrap();
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

export { Jupiter };
