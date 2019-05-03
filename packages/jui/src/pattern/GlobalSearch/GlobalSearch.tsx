/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-04-01 12:21:08
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { JuiDialog } from '../../components/Dialog/Dialog';
import { spacing, radius, width, height } from '../../foundation/utils/styles';
import styled from '../../foundation/styled-components';

const StyledGlobalSearch = styled(JuiDialog)`
  /* <height> - <margin> */
  height: calc(100% - 16px);
  && {
    .paper {
      margin: 0 auto;
      border-radius: ${radius('xl')};
      max-width: ${width(200)};
      max-height: calc(100% - ${height(14)});
      /* should be <min-height in user story> - <margin>, which is (400 - 8 * 2) / 4 */
      min-height: ${height(96)};
      min-width: ${width(120)};
      overflow: hidden;
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
    <StyledGlobalSearch
      classes={{ container: 'container' }}
      scroll="body"
      open={open}
      onClose={onClose}
      disablePortal={true}
    >
      {children}
    </StyledGlobalSearch>
  );
};

export { JuiGlobalSearch, JuiGlobalSearchProps };
