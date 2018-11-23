/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-22 10:52:22
 * Copyright © RingCentral. All rights reserved.
 */

import styled from '../../foundation/styled-components';
import { width, palette, spacing } from '../../foundation/utils';

type StyledMiniCardProps = {};

const StyledMiniCard = styled<StyledMiniCardProps, 'div'>('div')`
  /* z-index: ${({ theme }) => `${theme.zIndex.modal}`}; */
  width: ${width(72)};
  background-color: ${palette('common', 'white')};
  box-shadow: ${props => props.theme.shadows[5]};
  border-radius: ${spacing(1)};
`;

export { StyledMiniCard };
