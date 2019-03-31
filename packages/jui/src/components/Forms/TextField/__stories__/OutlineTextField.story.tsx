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
        round: 'round',
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
          iconPosition="left"
          disabled={disabled}
          radiusType={radius}
        />
        <br />
        <JuiOutlineTextField
          placeholder="Password"
          iconName="lock"
          iconPosition="right"
          disabled={disabled}
          radiusType={radius}
        />
        <br />
        <JuiOutlineTextField
          placeholder="Password"
          iconName={['search', 'close']}
          iconPosition="both"
          disabled={disabled}
          radiusType={radius}
          onClickIconRight={() => alert('close')}
          inputAfter={<div onClick={() => alert('clear')}>clear</div>}
        />
      </div>
    );
  });
