/*
 * @Author: isaac.liu
 * @Date: 2019-07-03 09:46:12
 * Copyright © RingCentral. All rights reserved.
 */
import { ReactElement } from 'react';
import { WrapperType, IWrapper } from './interface';
import { enzymeCreator } from './EnzymeWrapper';
import { reactCreator } from './ReactWrapper';

function getWrapper(
  element: ReactElement,
  type: WrapperType = WrapperType.React,
): IWrapper {
  if (type === WrapperType.Enzyme) {
    return enzymeCreator(element);
  }
  return reactCreator(element);
}

export { getWrapper };
export * from './interface';
export * from './EnzymeWrapper';
export * from './ReactWrapper';
