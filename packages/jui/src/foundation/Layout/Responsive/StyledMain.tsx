/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-09-27 16:28:48
 * Copyright © RingCentral. All rights reserved.
 */

import styled, { css } from '../../styled-components';

type StyledMainProps = {
  minWidth: number;
};

const StyledMain = styled('div')`
  position: relative;
  height: 100%;
  flex: 1 1 0%;
  overflow: hidden;
  ${(props: StyledMainProps) =>
    css`
      min-width: ${props.minWidth}px;
    `};
`;

export { StyledMain };
