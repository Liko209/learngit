/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-20 16:06:10
 * Copyright © RingCentral. All rights reserved.
 */

import styled from '../../styled-components';

type Props = {
  width?: number;
};

const StyledMainPanel = styled<Props, 'div'>('div')`
  height: 100%;
  flex: 1;
  overflow: hidden;
`;

export { StyledMainPanel };
