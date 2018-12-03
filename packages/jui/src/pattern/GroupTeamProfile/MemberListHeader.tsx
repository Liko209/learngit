/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-11-29 17:29:02
 * Copyright © RingCentral. All rights reserved.
 */
import styled from '../../foundation/styled-components';
import { grey, height, spacing, typography } from '../../foundation/utils';

const StyledTitle = styled.div`
  ${typography('subheading')};
  color: ${grey('900')};
  height: ${height(12.5)};
  padding: 0 0 0 ${spacing(6)};
  line-height: ${height(12.5)};
  &.shadow {
    box-shadow: ${({ theme }) => theme.boxShadow.val3};
    z-index: ${({ theme }) => theme.zIndex.memberListHeader};
  }
`;
StyledTitle.displayName = 'StyledTitle';
export { StyledTitle };
