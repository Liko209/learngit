/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-09-27 16:28:48
 * Copyright © RingCentral. All rights reserved.
 */

import styled from '../../styled-components';
import { width, height } from '../../utils/styles';

type Props = {
  left: string;
  right: string;
  show: boolean;
};

// todo: have not UX design
const StyledButton = styled<Props, 'div'>('div')`
  position: absolute;
  top: 0;
  bottom: 0;
  right: auto;
  width: ${width(2.5)};
  height: ${height(5)};
  cursor: pointer;
  background-color: red;
  z-index: ${({ theme }) => theme.zIndex.drawer};
  left: ${(props: Props) => `${props.left}`};
  right: ${(props: Props) => `${props.right}`};
  display: ${(props: Props) => (props.show ? 'block' : 'none')};
`;

export { StyledButton };
