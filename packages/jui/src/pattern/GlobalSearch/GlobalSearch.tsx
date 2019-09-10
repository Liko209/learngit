/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-04-01 12:21:08
 * Copyright © RingCentral. All rights reserved.
 */
import React, { useLayoutEffect } from 'react';
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
};

const JuiGlobalSearch = (props: JuiGlobalSearchProps) => {
  const { open, onClose, children } = props;

  useLayoutEffect(() => {
    if (open) {
      // need to re-adjust UI hierarchy
      const dialog = document.querySelector('[role="dialog"]');
      if (dialog && dialog.parentNode) {
        dialog.parentNode.removeChild(dialog);
        document.body.append(dialog);
      }
    }
  }, [open]);

  return (
    <StyledGlobalSearch
      classes={{ container: 'container' }}
      scroll="body"
      open
      onClose={onClose}
      fixedAtTop
      hidden={!open}
    >
      {children}
    </StyledGlobalSearch>
  );
};

export { JuiGlobalSearch, JuiGlobalSearchProps };
