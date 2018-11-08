/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-11-08 20:12:37
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import styled from '../../../foundation/styled-components';
import { JuiCheckbox } from '../../../components/Checkbox';

type Props = {
  checked: boolean;
};

const StyledTaskCheckbox = styled(JuiCheckbox)`
  && {
    padding: 0;
  }
`;

const JuiTaskCheckbox = (props: Props) => (
  <StyledTaskCheckbox checked={props.checked} disableRipple={true} />
);

JuiTaskCheckbox.displayName = 'JuiTaskCheckbox';

export { JuiTaskCheckbox };
