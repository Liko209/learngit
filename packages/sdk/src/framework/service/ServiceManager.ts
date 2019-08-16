/*
 * @Author: Steve Chen (steve.chen@ringcentral.com)
 * @Date: 2018-06-24 15:41:55
 * Copyright © RingCentral. All rights reserved
 */
import { Container } from 'foundation/ioc';
import { IService } from './IService';
import { EventEmitter2 } from 'eventemitter2';

class ServiceManager extends EventEmitter2 {
  private _serviceMap: Map<string, IService> = new Map();

  constructor(private _container: Container) {
    super();
  }

  getServices(names: string[]): IService[] {
    const services: IService[] = [];
    this._serviceMap.forEach((service, name) => {
      if (names.includes(name)) {
        services.push(service);
      }
    });
    return services;
  }

  getAllServices() {
    const services: IService[] = [];
    this._serviceMap.forEach(value => services.push(value));
    return services;
  }

  getAllServiceNames() {
    const names: string[] = [];
    this._serviceMap.forEach((service, name) => names.push(name));
    return names;
  }

  getService(name: string): IService | null {
    return this._serviceMap.get(name) || null;
  }

  async startService(name: string): Promise<IService> {
    let service = this.getService(name);

    if (!service) {
      if (this._container.isAsync(name)) {
        service = await this._container.asyncGet<IService>(name);
      } else {
        service = this._container.get<IService>(name);
      }
    }

    if (!service.isStarted()) {
      service.start();
    }

    this._serviceMap.set(name, service);

    return service;
  }

  async startServices(services: string[]): Promise<IService[]> {
    const promises = services.map(service => this.startService(service));
    return Promise.all(promises);
  }

  stopService(name: string): void {
    const service = this.getService(name);
    if (service) {
      service.stop();
      this._serviceMap.delete(name);
    }
  }

  stopServices(services: string[]): void {
    services.forEach(service => {
      this.stopService(service);
    });
  }

  stopAllServices() {
    this.getAllServiceNames().forEach(service => this.stopService(service));
  }
}

export { ServiceManager };
