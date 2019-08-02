/*
 * @Author: isaac.liu
 * @Date: 2019-07-03 09:46:30
 * Copyright © RingCentral. All rights reserved.
 */
import { ComponentType } from 'react';

interface IWrapper<T> {
  // init with element
  init(origin: T): void;

  // find node by `data-test-automation-id`, if `firstOnly` is true, will
  // only return the first found result.
  findByAutomationID(id: string, firstOnly: boolean): IWrapper<T>;

  find(component: ComponentType): IWrapper<T>[];

  findByProps(props: any): IWrapper<T>;

  findWhere(predicate: (wrapper: T) => boolean): IWrapper<T>[];

  // simulate mouse click event
  click(): void;

  // simulate `ENTER` key pressed
  enter(): void;

  // simulate typing event
  input(text: string): void;

  // commit all updates to internal object
  flush(): void;

  toString(): string;
}

enum WrapperType {
  Enzyme,
  React,
}

export { IWrapper, WrapperType };
