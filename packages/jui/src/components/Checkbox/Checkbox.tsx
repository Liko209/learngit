/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-11-08 20:27:39
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import Checkbox, { CheckboxProps } from '@material-ui/core/Checkbox';
import styled from '../../foundation/styled-components';

const StyledCheckbox = styled(Checkbox)``;

const JuiCheckbox = (props: CheckboxProps) => <StyledCheckbox {...props} />;

JuiCheckbox.displayName = 'JuiCheckbox';

export { JuiCheckbox };
