import React, { ReactElement } from 'react';
import styled from '../../foundation/styled-components';
import { DialogTitleProps, DialogTitle } from './DialogTitle';
import { spacing } from '../../foundation/utils/styles';

interface IDialogTitleProps extends DialogTitleProps {
  titleComp?: ReactElement<DialogTitleProps>;
}

const DialogHeader = styled(
  ({ children, titleComp, className, ...props }: IDialogTitleProps) => {
    return (
      <div className={className}>
        {titleComp && titleComp.type === DialogTitle && titleComp}
        {children}
      </div>
    );
  },
)`
  & {
    padding: ${spacing(6)};
    padding-bottom: ${({ children }) => !children && '0px'};
  }

  & .root {
    padding: 0;
    padding-bottom: ${spacing(5)};
    margin: 0;
  }
`;

export default DialogHeader;
export { DialogHeader };
