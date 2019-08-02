/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-06-28 14:55:19
 * Copyright © RingCentral. All rights reserved.
 */
import React, {
  ComponentType,
  ForwardRefExoticComponent,
  forwardRef,
} from 'react';
import { JuiAutoSizer, Size } from './AutoSizer';

type Omit<T, K> = Pick<T, Exclude<keyof T, K>>;

/**
 * A HoC used for auto calculate width/height
 * of parent and apply to the component
 */
function withAutoSizer<P, API>(
  Component: ComponentType<P>,
): ForwardRefExoticComponent<
  Omit<P, 'width' | 'height'> & React.RefAttributes<API>
> {
  return forwardRef(function(props: P, ref: React.RefObject<API>) {
    return (
      <JuiAutoSizer>
        {(size: Size) => (
          <Component
            ref={ref}
            width={size.width}
            height={size.height}
            {...props}
          />
        )}
      </JuiAutoSizer>
    );
  }) as any;
}

export { withAutoSizer };
