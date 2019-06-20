/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2019-05-24 15:54:51
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import styled from '../../foundation/styled-components';

import { palette } from '../../foundation/utils/styles';

const StyledSpan = styled.span`
  color: ${palette('text', 'primary')};
  background-color: ${palette('secondary', '100')};
  a {
    color: inherit;
  }
`;

const JuiTextWithHighlight = (props: {
  children: React.ReactChild | null | (React.ReactChild | null)[];
}) => <StyledSpan className="highlight-term" {...props} />;

export { JuiTextWithHighlight };
