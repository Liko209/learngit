import React, { ReactElement } from 'react';
import DialogTitle, { DialogTitleProps } from '@material-ui/core/DialogTitle';
import styled from 'styled-components';

interface Props extends DialogTitleProps {
  titleComp?: ReactElement<DialogTitleProps>|false;
}

const Title = (props:DialogTitleProps) => {
  return  <DialogTitle {...props} classes={{ root: 'root' }} />;
};

const header =  styled(({ children, titleComp, className, ...props   } :Props) => {
  return (
  <div className={className}>
    {titleComp && titleComp.type === Title && titleComp}
   {children}
  </div>);
})`
&{
  padding:24px;
  padding-bottom: ${({ children }) => !children && '0px'}
}

& .root {
  padding:0;
  padding-bottom: 20px;
  margin: 0;
}
`;
export default header;
export  { Title as DialogTitle };
