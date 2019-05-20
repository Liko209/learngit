/*
 * @Author: wayne.zhou
 * @Date: 2019-05-16 10:48:56
 * Copyright © RingCentral. All rights reserved.
 */

import React, { memo } from 'react';
import styled from '../../../foundation/styled-components';
import { spacing } from '../../../foundation/utils';

export type JuiSectionDividerProps = {
  gap: number;
  children: React.ReactNode;
};

const StyledSpacer = styled.div<JuiSectionDividerProps>`
  && > *:nth-last-child(n + 2) {
    margin-bottom: ${({ gap }) => spacing(gap)};
  }
`;

const JuiSectionDivider = memo(({ gap, children }: JuiSectionDividerProps) => (
  <StyledSpacer gap={gap}>{children}</StyledSpacer>
));

JuiSectionDivider.displayName = 'JuiSectionDivider';

export { JuiSectionDivider };
