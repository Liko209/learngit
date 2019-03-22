/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-03-12 18:09:12
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { ShallowRendererProps } from 'enzyme';

function unwrapMemo(
  node: React.ReactElement<any>,
  options?: ShallowRendererProps,
) {
  let unwrappedNode = node;
  if (
    typeof node.type === 'object' &&
    (node.type as any).$$typeof === Symbol.for('react.memo')
  ) {
    unwrappedNode = Object.create(node, {
      type: {
        configurable: true,
        enumerable: true,
        value: (node.type as any).type,
      },
    });
  }

  return unwrappedNode;
}

export { unwrapMemo };
