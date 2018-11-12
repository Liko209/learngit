/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-12 10:01:07
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import styled from '../../foundation/styled-components';
import { grey, spacing, typography } from '../../foundation/utils/styles';

const StyledBox = styled('div')`
  padding: ${spacing(4, 8)};
  text-align: center;
`;

const StyledContent = styled('div')`
  ${typography('body2')};
`;

const StyledDate = styled('div')`
  ${typography('body1')};
  color: ${grey('500')};
`;

type Props = {
  // person?: JSX.Element;
  content: string;
  date: string;
};

const JuiNotification = ({ content, date }: Props) => {
  return (
    <StyledBox>
      <StyledContent>{content}</StyledContent>
      <StyledDate>{date}</StyledDate>
    </StyledBox>
  );
};

export { JuiNotification };
