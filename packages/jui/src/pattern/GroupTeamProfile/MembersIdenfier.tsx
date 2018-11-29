/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-11-27 14:33:02
 * Copyright © RingCentral. All rights reserved.
 */
import styled from '../../foundation/styled-components';
import { grey, height, palette, spacing, typography, width } from '../../foundation/utils';

const StyledGuestIdentifier = styled.span`
  width: ${width(12)};
  height: ${height(4)};
  color: ${palette('common', 'white')};
  background-color: ${grey('400')};
  border-radius: ${({ theme }) => theme.shape.borderRadius * 2}px;
  line-height: ${height(4)};
  text-align: center;
  ${typography('caption1')};
  margin-left: ${spacing(3)};
  margin-right: ${spacing(4)};
`;
const StyledAdminIdentifier = styled(StyledGuestIdentifier)`
  background-color: ${palette('secondary', 'main')};
`;
export { StyledGuestIdentifier, StyledAdminIdentifier };
