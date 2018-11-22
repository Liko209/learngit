/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-22 10:52:22
 * Copyright © RingCentral. All rights reserved.
 */

import styled from '../../foundation/styled-components';
import { width, palette } from '../../foundation/utils';

type StyledMiniCardProps = {
  left: number;
  top: number;
};

const StyledMiniCard = styled<StyledMiniCardProps, 'div'>('div')`
  position: absolute;
  left: ${({ left }: StyledMiniCardProps) => `${left}px`};
  top: ${({ top }: StyledMiniCardProps) => `${top}px`};
  z-index: ${({ theme }) => `${theme.zIndex.modal}`};
  width: ${width(72)};
  background-color: ${palette('common', 'white')};
  border: 1px solid red;
`;

export { StyledMiniCard };
