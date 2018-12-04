/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-11-27 14:33:02
 * Copyright © RingCentral. All rights reserved.
 */
import styled from '../../foundation/styled-components';
import { palette, width } from '../../foundation/utils';

const JuiGroupProfileBottomBar = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  border: ${width(3)} solid ${palette('common', 'white')};
  box-shadow: ${({ theme }) => theme.boxShadow.val2};
`;
JuiGroupProfileBottomBar.displayName = 'JuiGroupProfileBottomBar';
export { JuiGroupProfileBottomBar };
