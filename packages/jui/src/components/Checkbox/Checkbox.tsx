/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-11-08 20:27:39
 * Copyright © RingCentral. All rights reserved.
 */
import React, { memo } from 'react';
import Checkbox, { CheckboxProps } from '@material-ui/core/Checkbox';
// import styled from '../../foundation/styled-components';

// const StyledCheckbox = styled(Checkbox)``;

const JuiCheckbox = memo((props: CheckboxProps) => {
  return <Checkbox {...props} />;
});

JuiCheckbox.displayName = 'JuiCheckbox';

export { JuiCheckbox, CheckboxProps };
