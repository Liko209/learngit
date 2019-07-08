/*
 * @Author: Paynter Chen
 * @Date: 2019-06-09 12:28:38
 * Copyright © RingCentral. All rights reserved.
 */

type UniqueItem = {
  name: string;
  identify?: Symbol;
};

interface IRegisterItemManager<T extends UniqueItem> {
  register(item: T): void;
  unRegister(item: T): void;
  get(identify: Symbol | string): T | undefined;
  getAll(): T[];
}

interface IHealthModuleManager extends IRegisterItemManager<IHealthModule> {}

interface IHealthModule
  extends UniqueItem,
    IRegisterItemManager<IHealthStatusItem> {
  identify: Symbol;
}

interface IHealthStatusItem<T = any> extends UniqueItem {
  getStatus(): T | Promise<T>;
}

export {
  UniqueItem,
  IRegisterItemManager,
  IHealthModuleManager,
  IHealthModule,
  IHealthStatusItem,
};
