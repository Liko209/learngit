/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-07-22 10:49:43
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import Checkbox, { CheckboxProps } from '@material-ui/core/Checkbox';
import { RuiIconography } from '../Iconography';
import styled from 'styled-components';

type RuiCheckboxProps = CheckboxProps;

const RuiCheckbox = styled(
  React.memo((props: RuiCheckboxProps) => {
    return (
      <Checkbox
        icon={<RuiIconography icon={'unselect'} />}
        checkedIcon={<RuiIconography icon={'selects'} />}
        indeterminateIcon={<RuiIconography icon={'indeterminate'} />}
        {...props}
      />
    );
  }),
)``;

export { RuiCheckbox, RuiCheckboxProps };
