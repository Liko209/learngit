/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-12-05 16:33:44
 * Copyright © RingCentral. All rights reserved.
 */

// import React from 'react';
import styled from '../../../foundation/styled-components';
import { spacing, grey, typography } from '../../../foundation/utils/styles';

const JuiProfileDialogContentMembers = styled('div')`
  padding: 0;
`;

const JuiProfileDialogContentMemberHeader = styled('div')`
  ${typography('subheading')};
  color: ${grey('900')};
  padding: ${spacing(4, 6, 3)};
  &.shadow {
    box-shadow: ${({ theme }) => theme.boxShadow.val3};
    z-index: ${({ theme }) => theme.zIndex.memberListHeader};
  }
`;

export { JuiProfileDialogContentMembers, JuiProfileDialogContentMemberHeader };
