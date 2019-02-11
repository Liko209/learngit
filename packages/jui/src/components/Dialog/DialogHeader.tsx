import React, { ReactElement, memo } from 'react';
import styled from '../../foundation/styled-components';
import { JuiDialogTitleProps, JuiDialogTitle } from './DialogTitle';
import { spacing } from '../../foundation/utils/styles';

type JuiDialogHeaderProps = JuiDialogTitleProps & {
  titleComp?: ReactElement<JuiDialogTitleProps>;
};

const JuiDialogHeader = styled(
  memo(({ children, titleComp, className }: JuiDialogHeaderProps) => {
    return (
      <div className={className}>
        {titleComp && titleComp.type === JuiDialogTitle && titleComp}
        {children}
      </div>
    );
  }),
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

export { JuiDialogHeader };
