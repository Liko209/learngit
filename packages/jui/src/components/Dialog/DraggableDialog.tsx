import React, { PureComponent } from 'react';
import Draggable, {
  DraggableEventHandler,
  DraggableEvent,
} from 'react-draggable';
import { JuiDialog, JuiDialogProps } from './Dialog';
import { JuiPaper, JuiPaperProps } from '../Paper';
import styled, {
  withTheme,
  ThemeProps,
} from '../../foundation/styled-components';
import Transition from 'react-transition-group/Transition';
import { JuiFade } from '../Animation';
import { TransitionProps } from '@material-ui/core/transitions/transition';

type PaperProps = {
  x: number;
  y: number;
  open: boolean;
  position: { x: number; y: number };
  dragRef?: React.RefObject<any>;
  onStart?: DraggableEventHandler;
  onStop?: DraggableEventHandler;
  onDrag?: DraggableEventHandler;
  handle?: string;
  TransitionComponent?: React.ComponentType<TransitionProps | any>;
} & JuiPaperProps;

type JuiDraggableDialogProps = PaperProps &
  JuiDialogProps &
  Partial<ThemeProps> & {
    goToTop?: boolean;
    forceToTop?: boolean;
  };

const PaperComponent = ({
  x,
  y,
  open,
  dragRef,
  onStart,
  onStop,
  onDrag,
  handle,
  position,
  TransitionComponent = JuiFade,
  ...rest
}: PaperProps) => (
  <Draggable
    bounds="body"
    // defaultPosition={{ x: Math.round(x), y: Math.round(y) }}
    position={position}
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

const StyledDraggableDialog = styled(JuiDialog)`
  && .react-draggable {
    position: fixed;
    z-index: ${({ theme }) => theme.zIndex.modal};
    top: 0;
    left: 0;
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

class DraggableDialog extends PureComponent<JuiDraggableDialogProps> {
  componentDidUpdate(prevProps: JuiDraggableDialogProps) {
    const { goToTop, theme, forceToTop } = this.props;
    const { goToTop: prevGoToTop } = prevProps;
    if (
      ((!prevGoToTop && goToTop) || (prevGoToTop && !goToTop) || forceToTop) &&
      theme
    ) {
      const dialogs = document.querySelectorAll<HTMLElement>('[role="dialog"]');
      dialogs.forEach(dialog => {
        dialog.style.zIndex = goToTop
          ? `${theme.zIndex.modal - 1}`
          : `${theme.zIndex.modal}`;
      });
    }
  }

  render(): React.ReactNode {
    const {
      x,
      y,
      dragRef,
      onStart,
      onStop,
      onDrag,
      position,
      handle,
      PaperProps,
      open,
      TransitionComponent,
      theme,
      goToTop,
      forceToTop,
      ...rest
    } = this.props;
    const paperProps = {
      x,
      y,
      open,
      dragRef,
      position,
      onDrag,
      TransitionComponent,
      ...PaperProps,
    } as PaperProps;

    return (
      <StyledDraggableDialog
        style={{
          position: 'static',
          right: '0',
          left: '0',
          top: '0',
          bottom: '0',
        }}
        PaperComponent={PaperComponent}
        TransitionComponent={Transition}
        disableBackdropClick
        disableEscapeKeyDown
        disableEnforceFocus
        disableRestoreFocus
        hideBackdrop
        closeAfterTransition
        open={open}
        fullScreen={false}
        PaperProps={paperProps}
        {...rest}
      />
    );
  }
}

const JuiDraggableDialog = withTheme(DraggableDialog);

export { JuiDraggableDialog, DraggableEvent };
