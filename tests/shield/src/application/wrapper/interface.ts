/*
 * @Author: isaac.liu
 * @Date: 2019-07-03 09:46:30
 * Copyright © RingCentral. All rights reserved.
 */
interface IWrapper {
  init(origin: any): void;

  findByAutomationID(id: string, firstOnly: boolean): IWrapper;

  toString(): string;
}

enum WrapperType {
  Enzyme,
  React,
}

export { IWrapper, WrapperType };
