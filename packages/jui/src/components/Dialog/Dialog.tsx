import React, { memo } from 'react';
import MuiDialog, {
  DialogProps as MuiDialogProps,
} from '@material-ui/core/Dialog';
import withMobileDialog from '@material-ui/core/withMobileDialog';
import styled from 'styled-components';
import { HotKeys } from '../../hoc/HotKeys';

type StyledDialogProps = MuiDialogProps & {
  size?: 'small' | 'fullWidth' | 'medium' | 'large' | 'fullScreen';
};

type JuiDialogProps = StyledDialogProps & {
  enableEscapeClose?: boolean;
  onClose?: (event: KeyboardEvent) => void;
};

const StyledDialog = styled(
  memo(({ size = 'medium', classes, ...restProps }: StyledDialogProps) => {
    switch (size) {
      case 'small':
        restProps.maxWidth = 'xs';
        break;
      case 'medium':
        restProps.maxWidth = 'sm';
        break;
      case 'large':
        restProps.maxWidth = 'md';
        break;
      case 'fullScreen':
        restProps.maxWidth = false;
        restProps.fullScreen = true;
        break;
    }

    const initClasses = {
      ...classes,
      paper: `paper ${(classes && classes.paper) || ''}`,
      root: `root ${(classes && classes.root) || ''}`,
    };

    return <MuiDialog classes={initClasses} {...restProps} />;
  }),
)`
  & .paper {
    width: 100%;
  }
  & .paper.overflow-y {
    overflow-y: visible;
  }
`;

const WrapDialog = (props: JuiDialogProps) => {
  const {
    enableEscapeClose = false,
    disableEscapeKeyDown,
    onClose,
    ...rest
  } = props;
  const enableEscapeCloseHotKey = enableEscapeClose && !disableEscapeKeyDown;
  return enableEscapeCloseHotKey ? (
    <HotKeys
      keyMap={{
        esc: event => onClose && onClose(event),
      }}
    >
      <StyledDialog {...rest} onClose={onClose} />
    </HotKeys>
  ) : (
    <StyledDialog {...rest} onClose={onClose} />
  );
};

const JuiDialog = withMobileDialog<JuiDialogProps>({ breakpoint: 'xs' })(
  WrapDialog,
);
export { JuiDialog, JuiDialogProps };
