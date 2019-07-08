/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-06-28 14:55:19
 * Copyright © RingCentral. All rights reserved.
 */
import React, { ComponentType } from 'react';
import { JuiAutoSizer, Size } from './AutoSizer';

/**
 * A HoC used for auto calculate width/height
 * of parent and apply to the component
 */
function withAutoSizer<P>(
  Component: ComponentType<P>,
): ComponentType<Pick<P, Exclude<keyof P, 'width' | 'height'>>> {
  return function(props: P) {
    return (
      <JuiAutoSizer>
        {(size: Size) => (
          <Component width={size.width} height={size.height} {...props} />
        )}
      </JuiAutoSizer>
    );
  };
}

export { withAutoSizer };
