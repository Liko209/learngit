/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-11-27 14:33:02
 * Copyright © RingCentral. All rights reserved.
 */
import styled from '../../foundation/styled-components';
import { palette, spacing, typography } from '../../foundation/utils';

const StyledGuestIdentifier = styled.span`
  color: ${palette('common', 'white')};
  border-radius: ${({ theme }) => theme.shape.borderRadius * 2}px;
  text-align: center;
  padding: ${spacing(0)} ${spacing(1.5)};
  ${typography('caption1')};
  margin-left: ${spacing(3)};
  margin-right: ${spacing(4)};
`;
const StyledAdminIdentifier = styled(StyledGuestIdentifier)`
  background-color: ${palette('secondary', 'main')};
`;
export { StyledGuestIdentifier, StyledAdminIdentifier };
