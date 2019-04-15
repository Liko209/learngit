/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2019-02-28 10:54:30
 * Copyright © RingCentral. All rights reserved.
 */

import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { withInfoDecorator } from '../../../../foundation/utils/decorators';
import { select, boolean, number } from '@storybook/addon-knobs';

import { JuiOutlineTextField } from '../';

storiesOf('Components/Forms', module)
  .addDecorator(withInfoDecorator(JuiOutlineTextField, { inline: true }))
  .add('OutlineTextField', () => {
    const maxLength = number('maxLength', 20);
    const disabled = boolean('disabled', false);
    const radius = select(
      'radiusType',
      {
        circle: 'circle',
        rounded: 'rounded',
        rectangle: 'rectangle',
      },
      'rounded',
    );
    const size = select(
      'size',
      {
        small: 'small',
        medium: 'medium',
        large: 'large',
      },
      'medium',
    );
    return (
      <div style={{ padding: '0 30%' }}>
        <JuiOutlineTextField
          InputProps={{
            placeholder: 'Typing keywords',
            inputProps: {
              maxLength,
            },
          }}
          disabled={disabled}
          radiusType={radius}
          size={size}
        />
        <br />
        <JuiOutlineTextField
          InputProps={{
            placeholder: 'Typing keywords',
            inputProps: {
              maxLength,
            },
          }}
          iconName="search"
          iconPosition="left"
          disabled={disabled}
          radiusType={radius}
          size={size}
        />
        <br />
        <JuiOutlineTextField
          InputProps={{
            placeholder: 'Typing keywords',
            type: 'password',
            inputProps: {
              maxLength,
            },
          }}
          iconName="lock"
          iconPosition="right"
          disabled={disabled}
          radiusType={radius}
          size={size}
        />
        <br />
        <JuiOutlineTextField
          InputProps={{
            placeholder: 'Typing keywords',
            inputProps: {
              maxLength,
            },
          }}
          iconName={['search', 'close']}
          iconPosition="both"
          disabled={disabled}
          radiusType={radius}
          size={size}
          onClickIconRight={() => alert('close')}
          inputAfter={
            <div
              style={{ padding: '0 0 0 12px' }}
              onClick={() => alert('clear')}
            >
              clear
            </div>
          }
        />
      </div>
    );
  });
