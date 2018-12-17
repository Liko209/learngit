/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-11-27 11:29:02
 * Copyright © RingCentral. All rights reserved.
 */
import styled from '../../foundation/styled-components';
import { spacing } from '../../foundation/utils';

const JuiGroupProfileMessageBtn = styled.div`
  display: flex;
  color: ${({ theme }) => theme.palette.primary.main};
  font-size: ${({ theme }) => theme.typography.body1.fontSize};
  cursor: pointer;
  outline:none;
  span {
    font-size: ${({ theme }) => theme.typography.h6.fontSize};
    margin-right: ${spacing(2)};
  }
`;
JuiGroupProfileMessageBtn.displayName = 'JuiGroupProfileMessageBtn';
export { JuiGroupProfileMessageBtn };
