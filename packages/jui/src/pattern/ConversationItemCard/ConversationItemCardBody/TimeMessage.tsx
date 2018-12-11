/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-11-08 14:58:05
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import styled from '../../../foundation/styled-components';
import { typography, grey } from '../../../foundation/utils/styles';

type Props = {
  time: string;
};

const StyledTimeMessage = styled.div`
  text-transform: capitalize;
  ${typography('body1')};
  color: ${grey('900')};
`;

const JuiTimeMessage = (props: Props) => (
  <StyledTimeMessage>{props.time}</StyledTimeMessage>
);

JuiTimeMessage.displayName = 'JuiTimeMessage';

export { JuiTimeMessage };
