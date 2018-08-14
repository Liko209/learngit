import React from 'react';
import Dialog, { DialogProps } from '@material-ui/core/Dialog';
import styled from 'styled-components';

interface Props extends DialogProps {
  size: 'sm'|'fullWidth'|'md'|'large'|'false';
}
export default styled(({ size= 'false', ...restProps  } :Props) => {
  switch (size) {
    case 'sm':
      restProps.maxWidth = 'xs';
      break;
    case 'md':
      restProps.maxWidth = 'sm';
      break;
    case 'large':
      restProps.maxWidth = 'md';
      break;
    case 'fullWidth':
      restProps.fullWidth = true;
      break;
  }
  const classes = { root:'root', paperWidthXs:'sm', paperWidthSm:'md', paperWidthMd:'lg' };
  return (
    <Dialog
       classes={classes}
       {...restProps}
    />
  );
})`
&.root{
  padding:0;
}
& .sm{
  max-width:400px;
}
& .md{
  max-width:640px;
}
& .lg{
  max-width:800px;
}
& .paperScrollPaper{
  max-height: ${() => window.innerHeight % 8 * 8}px
}
`;
