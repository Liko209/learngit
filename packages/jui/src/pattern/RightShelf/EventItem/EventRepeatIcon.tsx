/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2019-01-18 10:52:00
 * Copyright © RingCentral. All rights reserved.
 */
import React, { memo } from 'react';

import { JuiIconography } from '../../../foundation/Iconography';
import styled from '../../../foundation/styled-components';
import { spacing } from '../../../foundation/utils';

enum REPEAT_ICON_TYPE {
  repeat = 'repeat',
}

const StyledRepeatIcon = styled(JuiIconography)`
  && {
    margin-right: ${spacing(2)};
  }
`;

const JuiEventRepeatIcon = memo(() => {
  return (
    <StyledRepeatIcon iconSize="extraSmall">
      {REPEAT_ICON_TYPE.repeat}
    </StyledRepeatIcon>
  );
});

export { JuiEventRepeatIcon };
