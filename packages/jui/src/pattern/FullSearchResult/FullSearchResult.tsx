/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2019-04-01 14:06:55
 * Copyright © RingCentral. All rights reserved.
 */
// import * as React from 'react';
import styled from '../../foundation/styled-components';
import { height, width } from '../../foundation/utils';

const JuiFullSearchWrapper = styled.div`
  display: flex;
  width: 100%;
`;

const JuiFullSearchResultWrapper = styled.div`
  min-height: ${height(50)};
  max-height: ${height(165)};
  width: ${width(132.5)};
  position: relative;
`;

export { JuiFullSearchWrapper, JuiFullSearchResultWrapper };
