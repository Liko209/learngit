/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2019-01-15 11:16:13
 * Copyright © RingCentral. All rights reserved.
 */
import React, { memo } from 'react';
import styled from '../../foundation/styled-components';
import { ellipsis } from '../../foundation/utils/styles';

type JuiListItemSecondaryTextProps = {
  children: React.ReactNode;
};

const ListItemSecondaryTextWrapper = styled('span')`
  display: flex;
  min-width: 0;
  align-items: center;
  ${ellipsis};
`;

const JuiListItemSecondaryText = memo(
  (Props: JuiListItemSecondaryTextProps) => {
    const { children } = Props;

    return (
      <ListItemSecondaryTextWrapper data-test-automation-id="list-item-secondary-text">
        {children}
      </ListItemSecondaryTextWrapper>
    );
  },
);

export { JuiListItemSecondaryText, JuiListItemSecondaryTextProps };
