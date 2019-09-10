/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2019-01-15 11:16:13
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import styled from '../../foundation/styled-components';
import { ellipsis } from '../../foundation/utils/styles';

type JuiListItemSecondaryTextProps = {
  children: React.ReactNode;
};

const JuiListItemSecondaryText = styled('span').attrs(() => ({
  'data-test-automation-id':"list-item-secondary-text"
}))`
  display: flex;
  min-width: 0;
  align-items: center;
  ${ellipsis};
`;

export { JuiListItemSecondaryText, JuiListItemSecondaryTextProps };
