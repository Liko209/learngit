/*
 * @Author: Steve Chen (steve.chen@ringcentral.com)
 * @Date: 2018-06-24 15:41:55
 * Copyright © RingCentral. All rights reserved
*/
import { IService } from './IService';
import { Container } from '../Container';
import { EventEmitter2 } from 'eventemitter2';

class ServiceManager extends EventEmitter2 {
  private _serviceMap: Map<string, IService> = new Map();

  constructor(private _container: Container) {
    super();
  }

  getServices(names: string[]): IService[] {
    let services: IService[] = [];
    this._serviceMap.forEach((service, name) => {
      if (names.includes(name)) {
        services.push(service);
      }
    });
    return services;
  }

  getAllServices() {
    let services: IService[] = [];
    this._serviceMap.forEach(value => services.push(value));
    return services;
  }

  getService(name: string): IService | null {
    return this._serviceMap.get(name) || null;
  }

  stopService(name: string): void {
    let service = this.getService(name);
    if (service) {
      this._stopService(service);
    }
  }

  startService(name: string): void {
    let service = this.getService(name) || this._container.get<IService>(name);
    if (!service.isStarted()) {
      service.start();
    }
    this._serviceMap.set(name, service);
  }

  startServices(services: string[]): void {
    services.forEach(service => {
      this.startService(service);
    });
  }

  stopServices(services: string[]): void {
    services.forEach(service => {
      this.stopService(service);
    });
  }

  stopAllServices() {
    this.getAllServices().forEach(service => this._stopService(service));
  }

  _stopService(service: IService) {
    service.stop();
    this._serviceMap.delete(name);
  }
}

export { ServiceManager };
