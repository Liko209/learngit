import React, { memo } from 'react';
import MuiDialog, {
  DialogProps as MuiDialogProps,
} from '@material-ui/core/Dialog';
import withMobileDialog from '@material-ui/core/withMobileDialog';
import styled from 'styled-components';
import { width } from '../../foundation/utils';

type JuiDialogProps = MuiDialogProps & {
  size?: 'small' | 'fullWidth' | 'medium' | 'large' | 'fullScreen';
};

const Dialog = styled(
  memo(({ size = 'small', ...restProps }: JuiDialogProps) => {
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
      paperWidthXs: 'xs',
      paperWidthSm: 'sm',
      paperWidthMd: 'md',
    };
    return <MuiDialog classes={classes} {...restProps} />;
  }),
)`
  &.root {
    padding: 0;
    min-height: 120px;
  }
  && .paper {
    margin: 0;
    max-width: inherit;
    overflow-y: visible;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
  }
  & .xs {
    width: ${width(100)};
  }
  & .sm {
    width: ${width(160)};
  }
  & .md {
    width: ${width(200)};
  }
  & .paperScrollPaper {
    max-height: ${({ theme }) => {
      console.log(theme);
      return theme.maxHeight.dialog;
    }};
  }
  & .paperFullScreen {
    width: 100%;
    max-width: 100%;
  }
`;

const JuiDialog = withMobileDialog<JuiDialogProps>({ breakpoint: 'xs' })(
  Dialog,
);
export { JuiDialog, JuiDialogProps };
