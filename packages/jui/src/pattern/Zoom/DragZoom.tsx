/*
 * @Author: Paynter Chen
 * @Date: 2019-02-28 15:17:02
 * Copyright © RingCentral. All rights reserved.
 */
import React, { Component, ComponentType, createRef, RefObject } from 'react';

import { Transform } from '../../foundation/utils/calculateZoom';
import { DragComponent, WithDragProps } from '../../hoc/withDrag';
import {
  withZoom,
  WithZoomProps,
  ZoomComponent,
  ZoomProps,
} from '../../hoc/withZoom';

type JuiDragZoomProps = WithDragProps &
  WithZoomProps & {
    transform: Transform;
  };

type JuiDragZoomState = {
  transform: Transform;
};

class JuiDragZoom extends Component<JuiDragZoomProps, JuiDragZoomState> {
  static defaultProps = {
    ratio: 1,
  };

  private _zoomRef: RefObject<any> = createRef();

  constructor(props: JuiDragZoomProps) {
    super(props);
    this.state = {
      transform: {
        scale: 1,
        translateX: 0,
        translateY: 0,
      },
    };
  }

  render() {
    const { children, ...rest } = this.props;
    const { transform } = this.state;
    return (
      <DragComponent
        onDragMove={({ distance, delta }) => {
          const [deltaX, deltaY] = delta;
          this.setState({
            transform: {
              ...transform,
              translateX: transform.translateX + deltaX / transform.scale,
              translateY: transform.translateY + deltaY / transform.scale,
            },
          });
        }}
      >
        <ZoomComponent
          ref={this._zoomRef}
          transform={transform}
          onTransformChange={(transform: Transform) => {
            this.setState({
              transform,
            });
          }}
        >
          {React.Children.map(children, (child: any) => {
            return React.cloneElement(child, {
              ...rest,
              transform,
            });
          })}
        </ZoomComponent>
      </DragComponent>
    );
  }
}

// function withDragZoom<P>(
//   Component: ComponentType,
//   // options?: WithZoomOptions = {},
// ): ComponentType<P & JuiDragZoomProps> {
//   return (props: P) => {
//     return (
//       <JuiDragZoom {...props}>
//         <Component />
//       </JuiDragZoom>
//     );
//   };
// }

export { JuiDragZoom, JuiDragZoomProps };
