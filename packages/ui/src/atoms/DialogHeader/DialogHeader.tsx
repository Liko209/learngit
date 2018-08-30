import React, { ReactElement } from 'react';
import styled from '../../styled-components';
import { DialogTitleProps, DialogTitle } from '../DialogTitle';

interface IDialogTitleProps extends DialogTitleProps {
  titleComp?: ReactElement<DialogTitleProps>;
}

const DialogHeader =  styled(({ children, titleComp, className, ...props } :IDialogTitleProps) => {
  return (
  <div className={className}>
    {titleComp && titleComp.type === DialogTitle && titleComp}
    {children}
  </div>);
})`
& {
  padding: ${({ theme }) => `${theme.spacing.unit * 6}px`};
  padding-bottom: ${({ children }) => !children && '0px'}
}

& .root {
  padding:0;
  padding-bottom: ${({ theme }) => `${theme.spacing.unit * 5}px`};
  margin: 0;
}
`;

export default DialogHeader;
export  { DialogHeader };
