/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-04-01 12:21:08
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { JuiDialog } from '../../components/Dialog/Dialog';
import { spacing, radius, width, height } from '../../foundation/utils/styles';
import styled from '../../foundation/styled-components';
import { withDialogLevel, WithDialogLevelProps } from '../../hoc/withDialogLevel';

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
  onClose: (
    e: React.MouseEvent,
    reason: 'backdropClick' | 'escapeKeyDown',
  ) => void;
  children: React.ReactNode;
  hidden: boolean;
} & WithDialogLevelProps;

const JuiGlobalSearchInternal = (props: JuiGlobalSearchProps) => {
  const { open, onClose, children, hidden } = props;

  return (
    <StyledGlobalSearch
      classes={{ container: 'container' }}
      scroll="body"
      open={open}
      onClose={onClose}
      fixedAtTop
      hidden={hidden}
    >
      {children}
    </StyledGlobalSearch>
  );
};

const JuiGlobalSearch = withDialogLevel(JuiGlobalSearchInternal);

export { JuiGlobalSearch, JuiGlobalSearchProps };
