/*
 * @Author: isaac.liu
 * @Date: 2019-02-02 10:42:40
 * Copyright © RingCentral. All rights reserved.
 */
import styled from '../../../foundation/styled-components';
import { width, height, spacing, grey } from '../../../foundation/utils';

const IconWrapper = styled.div`
  && {
    display: flex;
    align-items: center;
    justify-content: center;
    width: ${width(4)};
    height: ${height(4)};
    min-width: ${width(4)};
    min-height: ${height(4)};
    margin: ${spacing(0, 2, 0, 0)};
    background: ${grey('100')};
    overflow: hidden;
    font-size: ${({ theme }) => theme.typography.subheading1.fontSize};
  }
`;

const Wrapper = styled.div`
  height: ${height(5)};
  display: flex;
  align-items: center;
  margin-top: ${spacing(1)};
  cursor: pointer;
`;

export { Wrapper, IconWrapper };
