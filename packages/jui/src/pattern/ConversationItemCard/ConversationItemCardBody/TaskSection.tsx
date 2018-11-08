/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-11-07 10:31:23
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import styled from '../../../foundation/styled-components';
import { typography, grey } from '../../../foundation/utils/styles';

type Props = {
  section: string;
};

const StyledTaskSection = styled.div`
  ${typography('caption1')};
  color: ${grey('500')};
  overflow: hidden;
  text-overflow: ellipsis;
`;

const JuiTaskSection = (props: Props) => (
  <StyledTaskSection>{props.section}</StyledTaskSection>
);

JuiTaskSection.displayName = 'JuiTaskSection';

export { JuiTaskSection };
