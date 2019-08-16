/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-04-01 12:21:08
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { JuiDialog } from '../../components/Dialog/Dialog';
import { spacing, radius, width, height } from '../../foundation/utils/styles';
import styled from '../../foundation/styled-components';

const StyledGlobalSearchWrapper = styled.div<{ show: boolean }>`
  display: ${({ show }) => (show ? 'block' : 'none')};
`;

const StyledGlobalSearch = styled(JuiDialog)`
  /* <height> - <margin> */
  height: calc(100% - 16px);

  && {
    .paper {
      margin: 0 auto;
      border-radius: ${radius('xl')};
      max-width: ${width(200)};
      max-height: ${height(153)};
      /* should be <min-height in user story>, which is 400 */
      min-height: ${height(100)};
      overflow: hidden;
      @media only screen and (max-width: 640px) {
        height: auto;
      }
    }
  }

  .container {
    margin: ${spacing(2)};
    align-items: flex-start;
    overflow-x: auto;
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
    <StyledGlobalSearchWrapper show={open}>
      <StyledGlobalSearch
        classes={{ container: 'container' }}
        scroll="body"
        open
        onClose={onClose}
        disablePortal
        fixedAtTop
      >
        {children}
      </StyledGlobalSearch>
    </StyledGlobalSearchWrapper>
  );
};

export { JuiGlobalSearch, JuiGlobalSearchProps };
