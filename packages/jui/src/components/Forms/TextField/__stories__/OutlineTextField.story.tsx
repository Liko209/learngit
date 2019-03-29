/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2019-02-28 10:54:30
 * Copyright © RingCentral. All rights reserved.
 */

import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { withInfoDecorator } from '../../../../foundation/utils/decorators';
import { select, boolean, number } from '@storybook/addon-knobs';

import { JuiOutlineTextField } from '..';

storiesOf('Components/Forms', module)
  .addDecorator(withInfoDecorator(JuiOutlineTextField, { inline: true }))
  .add('OutlineTextField', () => {
    const maxLength = number('maxLength', 20);
    const disabled = boolean('disabled', false);
    const radius = select(
      'radiusType',
      {
        square: 'square',
        circle: 'circle',
      },
      'square',
    );
    return (
      <div style={{ padding: '0 30%' }}>
        <JuiOutlineTextField
          placeholder="Typing keywords"
          maxLength={maxLength}
          disabled={disabled}
          radiusType={radius}
        />
        <br />
        <JuiOutlineTextField
          placeholder="Search members"
          iconName="search"
          disabled={disabled}
          iconPosition="left"
        />
        <br />
        <JuiOutlineTextField
          placeholder="Password"
          iconName="lock"
          iconPosition="right"
          disabled={disabled}
        />
        <br />
        <JuiOutlineTextField
          placeholder="Password"
          iconName="lock"
          iconPosition="right"
          disabled={disabled}
          inputAfter={<div onClick={() => alert('clear')}>clear</div>}
        />
      </div>
    );
  });
