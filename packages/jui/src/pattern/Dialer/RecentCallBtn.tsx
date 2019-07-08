/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2019-06-26 17:23:12
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { JuiFabButton, JuiFabProps } from '../../components/Buttons';
import styled from '../../foundation/styled-components';
import { spacing } from '../../foundation/utils';

type JuiRecentCallBtnProps = {
  automationId: string;
  handleClick: (event?: React.MouseEvent) => void;
} & JuiFabProps;

const StyleContainer = styled.div`
  && {
    position: absolute;
    right: ${spacing(12)};
    top: ${spacing(27)};
    z-index: 1;
  }
`;

const JuiRecentCallBtn = ({
  handleClick,
  automationId,
  ...rest
}: JuiRecentCallBtnProps) => (
    <StyleContainer>
      <JuiFabButton
        size="medium"
        data-test-automation-id={automationId}
        disableRipple
        onClick={handleClick}
        {...rest}
      />
    </StyleContainer>
);

export { JuiRecentCallBtn };
