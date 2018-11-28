/*
 * @Author: Andy Hu
 * @Date: 2018-11-23 10:04:37
 * Copyright © RingCentral. All rights reserved.
 */
import React, { RefObject, ComponentType } from 'react';

interface IntrinsicProps {
  viewRef: RefObject<any>;
}

function extractView<T>(Comp: ComponentType<any>): React.ComponentType<T> {
  return class extends React.PureComponent<T & IntrinsicProps> {
    render() {
      const { viewRef, ...rest } = this.props as IntrinsicProps;
      return <Comp {...rest} ref={viewRef} />;
    }
  };
}

export { extractView };
