/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-07-22 11:11:47
 * Copyright © RingCentral. All rights reserved.
 */
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { select } from '@storybook/addon-knobs';
import { RuiCheckbox } from '../Checkbox';
import {
  RuiFormGroup,
  RuiFormControlLabel,
  RuiFormControl,
  RuiFormLabel,
} from '../../Forms';

storiesOf('CheckBox', module)
  // .addDecorator(alignCenterDecorator)
  .add('checkbox', () => {
    const color = select(
      'color',
      {
        primary: 'primary',
        secondary: 'secondary',
        default: 'default',
      },
      'primary',
    );
    return (
      <div style={{ padding: '0 30px' }}>
        <RuiFormControlLabel
          control={<RuiCheckbox color={color} />}
          label="SecondarySecondarySecondarySecondarySecondarySecondarySecondarySecondarySecondarySecondary"
        />
        <br />
        <RuiFormControlLabel
          control={<RuiCheckbox color={color} indeterminate />}
          label="Indeterminate"
        />
        <br />
        <RuiFormControl>
          <RuiFormLabel>Pick two</RuiFormLabel>
          <RuiFormGroup>
            <RuiFormControlLabel
              control={<RuiCheckbox color={color} />}
              label="one"
            />
            <RuiFormControlLabel
              control={<RuiCheckbox color={color} />}
              label="two"
            />
          </RuiFormGroup>
        </RuiFormControl>
      </div>
    );
  });
