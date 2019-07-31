/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-07-26 19:10:57
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';

function filterReactElement<T>(children: React.ReactNode) {
  const elementChildren: React.ReactElement<T>[] = [];
  React.Children.forEach(children, child => {
    if (React.isValidElement<T>(child)) {
      elementChildren.push(child);
    }
  });
  return elementChildren;
}

export { filterReactElement };
