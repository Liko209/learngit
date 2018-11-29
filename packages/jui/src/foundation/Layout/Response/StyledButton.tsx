/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-09-27 16:28:48
 * Copyright © RingCentral. All rights reserved.
 */

import styled from '../../styled-components';

type Props = {
  left: string;
  right: string;
  show: boolean;
};

// todo: have not UX design
const StyledButton = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  right: auto;
  width: 10px;
  height: 20px;
  cursor: pointer;
  background-color: red;
  z-index: ${({ theme }) => theme.zIndex.modal};
  left: ${(props: Props) => `${props.left}`};
  right: ${(props: Props) => `${props.right}`};
  display: ${(props: Props) => (props.show ? 'block' : 'none')};
`;

export { StyledButton };
