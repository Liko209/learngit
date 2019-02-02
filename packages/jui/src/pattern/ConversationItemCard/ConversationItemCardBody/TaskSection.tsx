/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-11-07 10:31:23
 * Copyright © RingCentral. All rights reserved.
 */
import React, { memo } from 'react';
import styled from '../../../foundation/styled-components';
import { typography, grey } from '../../../foundation/utils/styles';

type Props = {
  section: string;
};

const StyledTaskSection = styled.div`
  ${typography('body1')};
  color: ${grey('500')};
  overflow: hidden;
  text-overflow: ellipsis;
`;

const JuiTaskSection = memo((props: Props) => (
  <StyledTaskSection>{props.section}</StyledTaskSection>
));

JuiTaskSection.displayName = 'JuiTaskSection';

export { JuiTaskSection };
