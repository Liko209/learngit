/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2019-04-01 14:06:55
 * Copyright © RingCentral. All rights reserved.
 */
import styled from '../../foundation/styled-components';
import { spacing } from '../../foundation/utils';

const JuiFullSearchWrapper = styled.div`
  display: flex;
  width: 100%;
`;

const JuiFullSearchResultWrapper = styled.div`
  width: 67%;
  padding-bottom: ${spacing(2)};
  position: relative;
  display: flex;
  flex-direction: column;
`;

const JuiFullSearchResultStreamWrapper = styled.div`
  position: relative;
  flex: 1;
  min-height: 0;
`;

export {
  JuiFullSearchWrapper,
  JuiFullSearchResultWrapper,
  JuiFullSearchResultStreamWrapper,
};
