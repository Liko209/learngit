import React, { PureComponent } from 'react';
import Draggable from 'react-draggable';
import { JuiDialog, JuiDialogProps } from './Dialog';
import { JuiPaper, JuiPaperProps } from '../Paper';
import styled from '../../foundation/styled-components';
import { spacing } from '../../foundation/utils/styles';

type JuiDraggableDialogProps = {
  x: number;
  y: number;
  dragRef: React.RefObject<any>;
} & JuiDialogProps;

const PaperComponent = (
  x: number,
  y: number,
  dragRef: React.RefObject<any>,
) => (props: JuiPaperProps) => {
  return (
    <Draggable bounds="body" defaultPosition={{ x, y }} ref={dragRef}>
      <JuiPaper {...props} />
    </Draggable>
  );
};

const StyledDraggableDialog = styled(JuiDialog)`
  &.root {
    bottom: auto;
    right: auto;
    top: auto;
    left: auto;
    position: static;
  }
  && .paper {
    position: fixed;
    z-index: ${({ theme }) => theme.zIndex.modal};
    top: 0;
    left: 0;
    width: auto;
    margin: ${spacing(8)};
    border-radius: 0;
    height: auto;
  }
`;

class JuiDraggableDialog extends PureComponent<JuiDraggableDialogProps> {
  render() {
    const { x, y, dragRef, ...rest } = this.props;
    return (
      <StyledDraggableDialog
        PaperComponent={PaperComponent(x, y, dragRef)}
        disableBackdropClick={true}
        disableEscapeKeyDown={true}
        disableEnforceFocus={true}
        disableRestoreFocus={true}
        hideBackdrop={true}
        {...rest}
      />
    );
  }
}

export { JuiDraggableDialog };
