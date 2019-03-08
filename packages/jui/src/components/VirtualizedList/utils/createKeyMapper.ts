/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-03-07 16:40:22
 * Copyright © RingCentral. All rights reserved.
 */
const createKeyMapper = (children: JSX.Element[]) => {
  return (i: number) => {
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
};

export { createKeyMapper };
