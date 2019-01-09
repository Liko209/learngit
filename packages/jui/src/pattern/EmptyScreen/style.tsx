/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-01-07 13:20:55
 * Copyright © RingCentral. All rights reserved.
 */
import styled from '../../foundation/styled-components';
import { spacing, typography, grey } from '../../foundation/utils';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding: ${spacing(9, 0, 0)};
  align-items: center;
  box-sizing: border-box;
`;

// 67 53
const Pic = styled.img`
  margin: ${spacing(0, 0, 7)};
`;

const Text = styled.div`
  ${typography('subheading1')};
  color: ${grey('900')};
  margin: ${spacing(0, 0, 2)};
`;

const Content = styled.div`
  ${typography('body1')};
  color: ${grey('700')};
  margin: ${spacing(0, 0, 3)};
`;

const ActionWrapper = styled.div`
  margin: ${spacing(0, 2, 4, 0)};
  &:last-child {
    margin: 0;
  }
`;

const Actions = styled.div`
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
`;

export { Wrapper, Pic, Text, Content, Actions, ActionWrapper };
