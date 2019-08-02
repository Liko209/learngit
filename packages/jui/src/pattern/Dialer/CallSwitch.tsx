/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2019-07-23 14:18:27
 * Copyright © RingCentral. All rights reserved.
 */
import React, { memo } from 'react';
import styled from '../../foundation/styled-components';
import { height, width, grey, typography } from '../../foundation/utils';
import image from './images/callswitch.svg';

type JuiCallSwitchProps = {
  message?: string;
};

const StyledCallSwitch = styled.div`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
`;

const StyledCallSwitchImage = styled.img`
  width: ${width(29)};
  height: ${height(17)};
`;

const StyledCallSwitchMessage = styled.span`
  ${typography('body1')};
  color: ${grey('700')};
  margin-top: ${height(4.5)};
  word-break: break-word;
`;

const JuiCallSwitchComponent = ({
  message = '',
  ...rest
}: JuiCallSwitchProps) => {
  const elImage = image ? <StyledCallSwitchImage src={image} /> : null;

  const elMessage = message ? (
    <StyledCallSwitchMessage>{message}</StyledCallSwitchMessage>
  ) : null;

  return (
    <StyledCallSwitch {...rest}>
      {elImage}
      {elMessage}
    </StyledCallSwitch>
  );
};

const JuiCallSwitch = memo(JuiCallSwitchComponent);

export { JuiCallSwitch };
