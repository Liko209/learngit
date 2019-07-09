import { INewable } from './types';

class Manager<Base> {
  private instances: Map<INewable<Base>, Base> = new Map();

  get<T extends Base>(Class: INewable<T>, ...args: any[]): T {
    if (!this.instances.has(Class)) {
      this.instances.set(Class, new Class(...args));
    }
    return this.instances.get(Class) as T;
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
