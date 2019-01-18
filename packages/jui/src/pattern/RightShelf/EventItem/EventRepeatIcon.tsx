/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2019-01-18 10:52:00
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';

import { JuiIconography } from '../../../foundation/Iconography';
import styled from '../../../foundation/styled-components';
import { spacing } from '../../../foundation/utils';

enum REPEAT_ICON_TYPE {
  repeat = 'repeat',
}

const StyledRepeatIcon = styled(JuiIconography)`
  && {
    font-size: ${({ theme }) => theme.typography.caption1.fontSize};
    margin-right: ${spacing(2)};
  }
`;

const JuiEventRepeatIcon = () => {
  return <StyledRepeatIcon>{REPEAT_ICON_TYPE.repeat}</StyledRepeatIcon>;
};

export { JuiEventRepeatIcon };
