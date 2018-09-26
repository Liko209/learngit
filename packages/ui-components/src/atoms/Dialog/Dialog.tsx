import React from 'react';
import MuiDialog, { DialogProps } from '@material-ui/core/Dialog';
import styled from 'styled-components';

export interface IDialogProps extends DialogProps {
  size?: 'small' | 'fullWidth' | 'medium' | 'large' | 'fullScreen';
}

const Dialog = styled(({ size = 'small', ...restProps }: IDialogProps) => {
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
  const classes = {
    root: 'root',
    paper: 'paper',
    paperWidthXs: 'sm',
    paperWidthSm: 'md',
    paperWidthMd: 'lg',
  };
  return <MuiDialog classes={classes} {...restProps} />;
})`
  &.root {
    padding: 0;
    min-height: 120px;
  }
  & .paper {
    max-width: inherit;
  }
  & .sm {
    width: 400px;
  }
  & .md {
    width: 640px;
  }
  & .lg {
    width: 800px;
  }
  & .paperScrollPaper {
    max-height: ${() => ((0.72 * window.innerHeight) % 8) * 8}px;
  }
  & .paperFullScreen {
    width: 100%;
    max-width: 100%;
  }
`;

export default Dialog;
export { Dialog };
