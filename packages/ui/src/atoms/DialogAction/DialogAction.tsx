import React from 'react';
import styled from '../../styled-components';
import MuiDialogActions, { DialogActionsProps } from '@material-ui/core/DialogActions';

const DialogActions = styled(({ ...props }:DialogActionsProps) => {
  return <MuiDialogActions {...props} classes={{ root:'root' }} disableActionSpacing={true}/>  ;
})`
&.root {
  padding: ${({ theme }) => `${theme.spacing.unit * 2}px ${theme.spacing.unit * 6}px`};
  margin: 0px;
}
`;

export default DialogActions;
export { DialogActions };
