/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-11-26 13:16:51
 * Copyright © RingCentral. All rights reserved.
 */
import styled from '../../../foundation/styled-components';
import { height, spacing, palette } from '../../../foundation/utils/styles';

const JuiInstantSearch = styled.div`
  /* position: absolute; */
  /* top: ${height(10)}; */
  /* left: 0; */
  /* width: 100%; */
  /* display: flex; */
  background: ${palette('common', 'white')};
  padding: ${spacing(2, 0)};
  /* flex-direction: column; */
  /* z-index: ${({ theme }) => `${theme.zIndex.drawer + 11}`}; */
  /* border-bottom-left-radius: ${spacing(1)}; */
  /* border-bottom-right-radius: ${spacing(1)}; */
`;

export { JuiInstantSearch };
