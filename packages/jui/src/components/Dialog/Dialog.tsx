import React from 'react';
import MuiDialog, {
  DialogProps as MuiDialogProps,
} from '@material-ui/core/Dialog';
import styled from 'styled-components';

type JuiDialogProps = MuiDialogProps & {
  size?: 'small' | 'fullWidth' | 'medium' | 'large' | 'fullScreen';
};

const JuiDialog = styled(({ size = 'small', ...restProps }: JuiDialogProps) => {
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
    paperScrollPaper: 'paperScrollPaper',
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
    max-height: 72vh;
  }
  & .paperFullScreen {
    width: 100%;
    max-width: 100%;
  }
`;

export { JuiDialog, JuiDialogProps };
