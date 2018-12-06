/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-12-05 16:33:44
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import styled from '../../../foundation/styled-components';
import { grey, spacing } from '../../../foundation/utils/styles';

type ContentBlockProps = {
  children: any;
};

const StyledContentBlock = styled('div')`
  border-bottom: 1px solid ${grey('300')};
  padding: ${spacing(5, 6)};
`;

const JuiProfileDialogContentBlock = ({ children }: ContentBlockProps) => {
  return <StyledContentBlock>{children}</StyledContentBlock>;
};

export { JuiProfileDialogContentBlock };
