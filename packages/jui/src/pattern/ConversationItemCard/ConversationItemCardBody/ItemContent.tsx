/*
 * @Author: Steven Zhuang (steven.zhuang@ringcentral.com)
 * @Date: 2019-01-18 14:48:38
 * Copyright © RingCentral. All rights reserved.
 */

import React, { memo } from 'react';
import styled from '../../../foundation/styled-components';
import { typography, grey, spacing } from '../../../foundation/utils/styles';

type Props = {
  children: React.ReactNode;
  title?: string;
};

const StyledWrapper = styled.div`
  margin-top: ${spacing(1)};
  margin-bottom: ${spacing(1)};
`;

const StyledChildrenWrapper = styled.div`
  display: flex;
  flex-direction: row;
`;

const StyledTitle = styled.div`
  ${typography('caption1')};
  color: ${grey('500')};
  overflow: hidden;
  text-overflow: ellipsis;
`;

const JuiItemContent = memo((props: Props) => {
  const { children, title } = props;
  return (
    <StyledWrapper>
      {title && <StyledTitle>{title}</StyledTitle>}
      <StyledChildrenWrapper>{children}</StyledChildrenWrapper>
    </StyledWrapper>
  );
});

JuiItemContent.displayName = 'JuiItemContent';

export { JuiItemContent };
