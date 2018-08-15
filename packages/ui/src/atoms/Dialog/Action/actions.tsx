import React from 'react';
import styled from 'styled-components';
import DialogActions, { DialogActionsProps } from '@material-ui/core/DialogActions';

const actions = styled(({  ...props }:DialogActionsProps) => {
  return <DialogActions {...props} classes={{ root:'root' }} disableActionSpacing={true}/>  ;
})`
&.root {
  padding:8px 24px;
  margin:0px;
}
`;

export default actions;
