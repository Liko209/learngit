/*
 * @Author: isaac.liu (isaac.liu@ringcentral.com)
 * @Date: 2018-12-17 23:18:54
 * Copyright © RingCentral. All rights reserved.
 */

import React, { CSSProperties, Component } from 'react';
import { withTheme } from 'styled-components';
import {
  DropTarget,
  DropTargetConnector,
  ConnectDropTarget,
  DropTargetMonitor,
} from 'react-dnd';
import { ThemeProps } from '../../foundation/theme/theme';
import { grey, width, palette } from '../../foundation/utils/styles';

type JuiDropZoneProps = {
  dropzoneClass?: CSSProperties;
};

class TargetBox extends Component<
  ITargetBoxProps & ITargetBoxCollectedProps & JuiDropZoneProps & ThemeProps
> {
  render() {
    const {
      isOver,
      connectDropTarget,
      dropzoneClass,
      children,
      theme,
    } = this.props;
    const style: CSSProperties = {
      border: isOver
        ? `2px dotted ${palette('secondary', '600')({ theme })}`
        : 'none',
      background: isOver ? grey('200')({ theme }) : 'transparent',
      opacity: isOver ? theme.palette.action.hoverOpacity * 2 : 1,
      flex: `${width(25)} 1 0`,
      // minHeight: 100 /* firefox compatibility */,
      ...dropzoneClass,
    };
    return connectDropTarget(<div style={style}>{children}</div>);
  }
}

const ThemedBox = withTheme(TargetBox);

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

const JuiDropZone = DropTarget<
  ITargetBoxProps & JuiDropZoneProps,
  ITargetBoxCollectedProps
>(
  (props: ITargetBoxProps) => props.accepts,
  boxTarget,
  (connect: DropTargetConnector, monitor: DropTargetMonitor) => ({
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver(),
    canDrop: monitor.canDrop(),
  }),
)(ThemedBox);

export { JuiDropZone, JuiDropZoneProps };
