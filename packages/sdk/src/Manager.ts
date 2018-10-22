import { INewable } from './types';

class Manager<Base> {
  private instances: Map<INewable<Base>, Base> = new Map();

  get<T extends Base>(Class: INewable<T>, ...args: any[]): T {
    let instance: T;

    if (!this.instances.has(Class)) {
      this.instances.set(Class, new Class(...args));
    }
    instance = this.instances.get(Class) as T;
    return instance;
  }

  destroy() {
    this.clear();
  }

  clear() {
    this.instances.clear();
  }

  get size() {
    return this.instances.size;
  }
}

export default Manager;
