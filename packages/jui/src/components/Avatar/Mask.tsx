/*
 * @Author: looper wang (looper.wang@ringcentral.com)
 * @Date: 2019-07-26 09:12:51
 * Copyright © RingCentral. All rights reserved.
 */
import styled from '../../foundation/styled-components';
import { palette } from '../../foundation/utils/styles';

const StyledMask = styled.div`
  position: absolute;
  bottom: 0;
  width: 100%;
  height: 27.5%;
  background-color: ${palette('common', 'black', 0.6)};
  right: 0;
  text-align: center;
  color: ${palette('common', 'white')};
`;

const StyledMaskWrapper = styled.div`
  position: relative;
  border-radius: 50%;
  background-color: ${palette('common', 'white')};
  overflow: hidden;
  cursor: pointer;
  &:after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: transparent;
  }
  &:hover:after {
    background: ${palette('common', 'white', 0.1)};
  }
`;

export { StyledMaskWrapper, StyledMask };
