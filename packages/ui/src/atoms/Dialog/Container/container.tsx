import React from 'react';
import Dialog, { DialogProps } from '@material-ui/core/Dialog';
import styled from 'styled-components';

interface Props extends DialogProps {
  size: 'sm'|'fullWidth'|'md'|'lg'|'fullScreen';
}

const container = styled(({ size = 'sm', ...restProps  } :Props) => {
  switch (size) {
    case 'sm':
      restProps.maxWidth = 'xs';
      break;
    case 'md':
      restProps.maxWidth = 'sm';
      break;
    case 'lg':
      restProps.maxWidth = 'md';
      break;
    case 'fullScreen':
      restProps.maxWidth = false;
      restProps.fullScreen = true;
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
  min-height: 120px;
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
  max-height: ${() => 0.72 * window.innerHeight % 8 * 8}px;
}
& .paperFullScreen{
  max-width: 100%;
}
`;

export default container;
