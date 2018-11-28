import React from 'react';
import { JuiButton, JuiButtonProps } from '../Buttons';

type JuiSnackbarActionProps = JuiButtonProps;

const JuiSnackbarAction = (props: JuiSnackbarActionProps) => (
  <JuiButton {...props} />
);

JuiSnackbarAction.defaultProps = {
  size: 'small',
  color: 'white',
  variant: 'text',
};

export { JuiSnackbarAction, JuiSnackbarActionProps };
