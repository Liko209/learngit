/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-11-27 14:33:02
 * Copyright © RingCentral. All rights reserved.
 */
import styled from '../../foundation/styled-components';
import { palette, spacing, typography, grey } from '../../foundation/utils';

const JuiGroupProfileGuestIdentifier = styled.span`
  color: ${palette('common', 'white')};
  border-radius: ${({ theme }) => theme.shape.borderRadius * 2}px;
  text-align: center;
  background-color: ${grey('400')};
  padding: ${spacing(0)} ${spacing(1.5)};
  ${typography('caption1')};
  margin-left: ${spacing(3)};
  margin-right: ${spacing(4)};
`;
const JuiGroupProfileAdminIdentifier = styled(JuiGroupProfileGuestIdentifier)`
  background-color: ${palette('secondary', 'main')};
`;
export { JuiGroupProfileGuestIdentifier, JuiGroupProfileAdminIdentifier };
