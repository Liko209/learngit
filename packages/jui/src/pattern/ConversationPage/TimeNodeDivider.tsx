/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-10-30 16:20:49
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import styled from '../../foundation/styled-components';
import { grey, height, spacing } from '../../foundation/utils/styles';
import { JuiDivider } from '../../components/Divider';

const StyledBox = styled('div')`
  color: ${grey('900')};
  height: ${height(12)};
  position: relative;
`;

const StyledDivider = styled(JuiDivider)`
  position: absolute;
  width: 100%;
  bottom: ${spacing(5)};
`;

const StyledText = styled('div')`
  position: absolute;
  bottom: ${spacing(3)};
  width: 100%;
  text-align: center;
  & span {
    background-color: ${({ theme }) => `${theme.palette.common.white}`};
    display: inline-block;
    padding: 0 ${spacing(4)};
  }
`;

type Props = {
  text: string;
};

const JuiTimeNodeDivider = ({ text }: Props) => {
  return (
    <StyledBox>
      <StyledDivider />
      <StyledText><span>{text}</span></StyledText>
    </StyledBox>
  );
};

export { JuiTimeNodeDivider };
