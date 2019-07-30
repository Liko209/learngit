import React from 'react';

/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-07-26 19:10:57
 * Copyright © RingCentral. All rights reserved.
 */

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
