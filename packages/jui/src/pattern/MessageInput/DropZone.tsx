/*
 * @Author: isaac.liu (isaac.liu@ringcentral.com)
 * @Date: 2018-12-17 23:18:54
 * Copyright © RingCentral. All rights reserved.
 */

import React, { CSSProperties, Component } from 'react';

import {
  DropTarget,
  DropTargetConnector,
  ConnectDropTarget,
  DropTargetMonitor,
} from 'react-dnd';

type DropZoneProps = {
  dropzoneClass?: CSSProperties;
};

class TargetBox extends Component<
  ITargetBoxProps & ITargetBoxCollectedProps & DropZoneProps
> {
  render() {
    const { isOver, connectDropTarget, dropzoneClass, children } = this.props;
    const style: CSSProperties = {
      border: isOver ? '2px dotted #ff8800' : 'none',
      background: isOver ? '#eee' : 'transparent',
      opacity: isOver ? 0.24 : 1,
      ...dropzoneClass,
    };
    return connectDropTarget(<div style={style}>{children}</div>);
  }
}

const boxTarget = {
  drop(props: ITargetBoxProps, monitor: DropTargetMonitor) {
    if (props.onDrop) {
      props.onDrop(props, monitor);
    }
  },
};

export interface ITargetBoxProps {
  accepts: string[];
  onDrop: (props: ITargetBoxProps, monitor: DropTargetMonitor) => void;
}

interface ITargetBoxCollectedProps {
  isOver: boolean;
  canDrop: boolean;
  connectDropTarget: ConnectDropTarget;
}

const DropZone = DropTarget<
  ITargetBoxProps & DropZoneProps,
  ITargetBoxCollectedProps
>(
  (props: ITargetBoxProps) => props.accepts,
  boxTarget,
  (connect: DropTargetConnector, monitor: DropTargetMonitor) => ({
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver(),
    canDrop: monitor.canDrop(),
  }),
)(TargetBox);

export { DropZone, DropZoneProps };
