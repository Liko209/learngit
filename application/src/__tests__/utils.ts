/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-02-01 17:53:18
 * Copyright © RingCentral. All rights reserved.
 */
import { ShallowRendererProps } from 'enzyme';
import React from 'react';

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
