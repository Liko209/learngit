import React from 'react';
import MuiDialogContent, { DialogContentProps } from '@material-ui/core/DialogContent';
import styled from '../../styled-components';
import { Theme } from '../../theme';

interface IDialogContentProps extends DialogContentProps
{
  fullWidth?:boolean;
}

const fullWidthStyle = (theme:Theme, fullWidth?:boolean) => {
  if (fullWidth) {
    return `
    margin:0 ${theme.spacing.unit * 6}px ${theme.spacing.unit * 5}px;
    `;
  }
  return `
    width:600px;
    margin:0 ${theme.spacing.unit * 6}px auto ${theme.spacing.unit * 5}px;
`;
};

const DialogContent = styled(({ fullWidth, ...props }:IDialogContentProps) => {
  return <MuiDialogContent {...props} classes={{ root:'root' }} />;
})`
& .root {
  ${({ theme, fullWidth }) => fullWidthStyle(theme, fullWidth)}
}
`;

export default DialogContent;
export { DialogContent };
