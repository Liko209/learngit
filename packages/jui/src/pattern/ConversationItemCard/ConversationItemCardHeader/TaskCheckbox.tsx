/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-11-08 20:12:37
 * Copyright © RingCentral. All rights reserved.
 */
import React, { memo } from 'react';
import styled from '../../../foundation/styled-components';
import { JuiCheckbox } from '../../../components/Checkbox';
import { palette } from '../../../foundation/utils';

type Props = {
  checked: boolean;
};

const StyledTaskCheckbox = styled(JuiCheckbox)`
  && {
    padding: 0;
    &.checked {
      color: ${palette('primary', 'main')};
    }
    svg {
      margin-top: 0;
    }
  }
`;

const JuiTaskCheckbox = memo((props: Props) => {
  return (
    <StyledTaskCheckbox
      classes={{
        checked: 'checked',
      }}
      checked={props.checked}
      disableRipple={true}
      {...props}
    />
  );
});

JuiTaskCheckbox.displayName = 'JuiTaskCheckbox';

export { JuiTaskCheckbox };
