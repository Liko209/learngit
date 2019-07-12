/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-03-07 16:40:22
 * Copyright © RingCentral. All rights reserved.
 */
import { VirtualizedListChild } from '../types';

const createKeyMapper = (children: VirtualizedListChild[]) => (i: number) => {
  let result: number | string = '';
  const child = children[i];
  if (child) {
    if (child.key === null) {
      throw new Error(
        "VirtualizedList Error: 'key' was required for <JuiVirtualizedList/>'s children",
      );
    } else {
      result = child.key;
    }
  }
  return result;
};

const createIndexMapper = (children: VirtualizedListChild[]) => (
  key: React.Key,
) => {
  const index = children.findIndex(child => Boolean(child.key && child.key === key),);
  return index;
};

export { createKeyMapper, createIndexMapper };
