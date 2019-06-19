type ClassType<T = any> = { new (): T };

export class InstanceManager {
  static instanceMap: { [uid: number]: Map<ClassType<any>, any> } = {};

  static get<T>(cls: ClassType<T>, uid: number = 1): T {
    InstanceManager.instanceMap[uid] =
      InstanceManager.instanceMap[uid] || (new Map<ClassType<T>, T>() as any);
    if (!InstanceManager.instanceMap[uid].has(cls)) {
      InstanceManager.instanceMap[uid].set(cls, new cls());
    }
    return InstanceManager.instanceMap[uid].get(cls);
  }

  static clear() {
    this.instanceMap = {};
  }
}
