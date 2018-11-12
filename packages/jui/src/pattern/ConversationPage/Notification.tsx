/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-12 10:01:07
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import styled from '../../foundation/styled-components';
import { spacing } from '../../foundation/utils/styles';

const StyledBox = styled('div')`
  padding: ${spacing(4, 8)};
  text-align: center;
`;

// const StyledContent = styled('div')`
//   ${typography('body2')};
// `;

// const StyledDate = styled('div')`
//   ${typography('body1')};
//   color: ${grey('500')};
// `;

type Props = {
  children: JSX.Element | null;
};

const JuiNotification = ({ children }: Props) => {
  return <StyledBox>{children}</StyledBox>;
};

export { JuiNotification };
