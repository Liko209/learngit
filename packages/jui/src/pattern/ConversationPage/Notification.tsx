/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-12 10:01:07
 * Copyright © RingCentral. All rights reserved.
 */

import React, { memo } from 'react';
import styled from '../../foundation/styled-components';
import {
  spacing,
  primary,
  typography,
  grey,
} from '../../foundation/utils/styles';

const StyledBox = styled('div')`
  padding: ${spacing(4, 8)};
  text-align: center;
  ${typography('body1')};
  color: ${grey('700')};

  .at_mention_compose {
    display: inline;
    padding: 0;
    border: none;
    background: none;
    cursor: pointer;
    ${typography('body2')};
    color: ${primary('700')};

    :active {
      outline: none;
    }
  }

  b {
    ${typography('body2')};
    color: ${grey('900')};
  }
  .datetime {
    ${typography('caption2')};
    color: ${grey('500')};
  }
`;

type Props = {
  onClick?: (e: React.MouseEvent) => any;
  children: JSX.Element | null;
};

const JuiNotification = memo(({ onClick, children }: Props) => {
  return <StyledBox onClick={onClick}>{children}</StyledBox>;
});

export { JuiNotification };
