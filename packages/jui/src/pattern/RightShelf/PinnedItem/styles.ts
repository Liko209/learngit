/*
 * @Author: isaac.liu
 * @Date: 2019-02-02 10:42:40
 * Copyright © RingCentral. All rights reserved.
 */
import styled from '../../../foundation/styled-components';
import { width, height, spacing } from '../../../foundation/utils';

const IconWrapper = styled.div`
  && {
    display: flex;
    align-items: center;
    justify-content: center;
    width: ${width(4)};
    height: ${height(4)};
    margin: ${spacing(0, 2, 0, 1)};
    overflow: hidden;
  }
`;

const Wrapper = styled.div`
  height: ${height(5)};
  display: flex;
  align-items: center;
  margin-top: ${spacing(1)};
`;

export { Wrapper, IconWrapper };
