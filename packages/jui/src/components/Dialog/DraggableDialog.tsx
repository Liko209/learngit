import React, { PureComponent } from 'react';
import Draggable, {
  DraggableEventHandler,
  DraggableEvent,
} from 'react-draggable';
import { JuiDialog, JuiDialogProps } from './Dialog';
import { JuiPaper, JuiPaperProps } from '../Paper';
import styled from '../../foundation/styled-components';
import Transition from 'react-transition-group/Transition';
import { JuiFade } from '../Animation';
import { TransitionProps } from '@material-ui/core/transitions/transition';

type PaperProps = {
  x: number;
  y: number;
  open: boolean;
  dragRef?: React.RefObject<any>;
  onStart?: DraggableEventHandler;
  onStop?: DraggableEventHandler;
  onDrag?: DraggableEventHandler;
  handle?: string;
  TransitionComponent?: React.ComponentType<TransitionProps>;
} & JuiPaperProps;

type JuiDraggableDialogProps = PaperProps & JuiDialogProps;

const PaperComponent = ({
  x,
  y,
  open,
  dragRef,
  onStart,
  onStop,
  onDrag,
  handle,
  TransitionComponent = JuiFade,
  ...rest
}: PaperProps) => {
  return (
    <Draggable
      bounds="body"
      defaultPosition={{ x, y }}
      ref={dragRef}
      onStart={onStart}
      onStop={onStop}
      onDrag={onDrag}
      handle={handle}
    >
      <div>
        <TransitionComponent in={open}>
          <JuiPaper {...rest} />
        </TransitionComponent>
      </div>
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
  && .react-draggable {
    position: fixed;
    z-index: ${({ theme }) => theme.zIndex.modal};
    top: 0;
    left: 0;
    max-height: 100%;
    overflow: hidden;
  }
  && .paper {
    width: auto;
    background-color: transparent;
    margin: 0;
    box-shadow: none;
    overflow: hidden;
  }
`;

class JuiDraggableDialog extends PureComponent<JuiDraggableDialogProps> {
  render() {
    const {
      x,
      y,
      dragRef,
      onStart,
      onStop,
      handle,
      PaperProps,
      open,
      TransitionComponent,
      ...rest
    } = this.props;
    const paperProps = {
      x,
      y,
      open,
      dragRef,
      TransitionComponent,
      ...PaperProps,
    } as PaperProps;

    return (
      <StyledDraggableDialog
        PaperComponent={PaperComponent}
        TransitionComponent={Transition}
        disableBackdropClick={true}
        disableEscapeKeyDown={true}
        disableEnforceFocus={true}
        disableRestoreFocus={true}
        hideBackdrop={true}
        closeAfterTransition={true}
        open={open}
        fullScreen={false}
        PaperProps={paperProps}
        {...rest}
      />
    );
  }
}

export { JuiDraggableDialog, DraggableEvent };
