/*
 * @Author: isaac.liu (isaac.liu@ringcentral.com)
 * @Date: 2018-12-17 23:18:54
 * Copyright © RingCentral. All rights reserved.
 */

import React, { CSSProperties, PureComponent } from 'react';
import { withTheme } from 'styled-components';
import {
  DropTarget,
  DropTargetConnector,
  ConnectDropTarget,
  DropTargetMonitor,
  DragDropContext,
} from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import { ThemeProps } from '../../foundation/theme/theme';
import { grey, palette } from '../../foundation/utils/styles';

type JuiDropZoneProps = {
  dropzoneClass?: CSSProperties;
};

class TargetBox extends PureComponent<
  ITargetBoxProps & ITargetBoxCollectedProps & JuiDropZoneProps & ThemeProps
> {
  private _checkFolder = (event: React.DragEvent) => {
    const { items } = event.dataTransfer;
    const { length } = items;
    let hasFolder = false;
    for (let i = 0; i < length; i++) {
      if (items[i].webkitGetAsEntry) {
        const entry = items[i].webkitGetAsEntry();
        if (entry && entry.isDirectory) {
          hasFolder = true;
          break;
        }
      }
    }
    if (hasFolder) {
      const { detectedFolderDrop } = this.props;
      detectedFolderDrop && detectedFolderDrop();
    }
  }
  render() {
    const {
      isOver,
      connectDropTarget,
      dropzoneClass,
      children,
      theme,
      hasDroppedFolder,
    } = this.props;
    const showHoverStyle = hasDroppedFolder
      ? !hasDroppedFolder() && isOver
      : isOver;
    const style: CSSProperties = {
      border: showHoverStyle
        ? `2px dotted ${palette('secondary', '600')({ theme })}`
        : 'none',
      background: showHoverStyle ? grey('200')({ theme }) : 'transparent',
      opacity: showHoverStyle ? theme.palette.action.hoverOpacity * 2 : 1,
      // minHeight: 100 /* firefox compatibility */,
      ...dropzoneClass,
    };
    return connectDropTarget(
      <div
        style={style}
        onDrop={this._checkFolder}
        onDragOver={this.props.clearFolderDetection}
      >
        {children}
      </div>,
    );
  }
}

const ThemedBox = withTheme(TargetBox);

const boxTarget = {
  canDrop(props: ITargetBoxProps) {
    if (props.disabled) {
      return false;
    }
    if (props.hasDroppedFolder && props.hasDroppedFolder()) {
      return false;
    }
    return true;
  },
  drop(props: ITargetBoxProps, monitor: DropTargetMonitor) {
    if (props.onDrop) {
      props.onDrop(props, monitor);
    }
  },
};

export interface ITargetBoxProps {
  accepts: string[];
  disabled?: boolean;
  onDrop: (props: ITargetBoxProps, monitor: DropTargetMonitor) => void;
  detectedFolderDrop?: () => void;
  hasDroppedFolder?: () => boolean;
  clearFolderDetection?: () => void;
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

const withDragDropContext = DragDropContext(HTML5Backend);

export { JuiDropZone, JuiDropZoneProps, withDragDropContext };
