import React, { memo } from 'react';
import MuiDialog, {
  DialogProps as MuiDialogProps,
} from '@material-ui/core/Dialog';
import withMobileDialog from '@material-ui/core/withMobileDialog';
import styled from 'styled-components';

type JuiDialogProps = MuiDialogProps & {
  size?: 'small' | 'fullWidth' | 'medium' | 'large' | 'fullScreen';
};

const Dialog = styled(
  memo(({ size = 'medium', ...restProps }: JuiDialogProps) => {
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
      paper: 'paper',
    };

    return <MuiDialog classes={classes} {...restProps} />;
  }),
)`
  & .paper {
    width: 100%;
  }
`;

const JuiDialog = withMobileDialog<JuiDialogProps>({ breakpoint: 'xs' })(
  Dialog,
);
export { JuiDialog, JuiDialogProps };
