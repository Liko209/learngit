import React from 'react';
import DialogContent, { DialogContentProps } from '@material-ui/core/DialogContent';
import styled from 'styled-components';

interface Props extends DialogContentProps
{
  fullWidth?:boolean;
}

const fullWidthStyle = ({ fullWidth }:Props) => {
  if (fullWidth) {
    return `
    margin:0px 24px 20px;
    `;
  }
  return `
    width:600px;
    margin:0px auto 20px;
  `;
};

const content = styled(({ fullWidth, ...props }:Props) => {
  return <DialogContent {...props} classes={{ root:'root' }} />  ;
})`
&.root {
  ${(props:Props) => fullWidthStyle(props)}
}
`;

export default content;
