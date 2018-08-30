import React from 'react';
import MuiDialogContent, { DialogContentProps } from '@material-ui/core/DialogContent';
import styled from '../../styled-components';
import { Theme } from '../../theme';
import { spacing } from '../../utils/styles';

interface IDialogContentProps extends DialogContentProps
{
  fullWidth?:boolean;
}

const fullWidthStyle = (theme:Theme, fullWidth?:boolean) => {
  if (fullWidth) {
    return `
    margin:${spacing(0, 6, 5)};
    `;
  }
  return `
    width:600px;
    margin:${spacing(0, 6, 5)};
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
