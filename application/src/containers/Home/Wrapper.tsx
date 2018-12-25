/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-10-11 09:40:29
 * Copyright © RingCentral. All rights reserved.
 */

import styled from 'styled-components';

const Wrapper: any = styled.div`
  width: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  z-index: ${({ theme }) => theme.zIndex.makeZIndexStackingContext};
`;

export default Wrapper;
