/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-04-01 12:21:08
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { JuiDialog } from '../../components/Dialog/Dialog';
import { spacing } from '../../foundation/utils/styles';
import styled from '../../foundation/styled-components';

const StyledGlobalSearch = styled(JuiDialog)`
  && {
    .paper {
      margin: 0;
      border-radius: ${({ theme }) => theme.radius.xl};
    }
  }
  .container {
    margin: ${spacing(2)};
    align-items: flex-start;
  }
`;

type JuiGlobalSearchProps = {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
};

const JuiGlobalSearch = (props: JuiGlobalSearchProps) => {
  const { open, onClose, children } = props;
  return (
    <StyledGlobalSearch
      classes={{ container: 'container' }}
      scroll="paper"
      open={open}
      onClose={onClose}
    >
      {children}
    </StyledGlobalSearch>
  );
};

export { JuiGlobalSearch, JuiGlobalSearchProps };
