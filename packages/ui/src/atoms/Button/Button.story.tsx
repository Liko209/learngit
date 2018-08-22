/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-08-22 15:23:59
 * Copyright © RingCentral. All rights reserved.
 */
/// <reference path="../../../.storybook/storybook.d.ts" />
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { boolean, select } from '@storybook/addon-knobs/react';
import { withInfo } from '@storybook/addon-info';

import Button from './';

storiesOf('Buttons', module)
  .addWithJSX('Button', withInfo(`
      description or documentation about my component, supports markdown

      ~~~js
      <Button>Click Here</Button>
      ~~~

  `)(
    () => {
      const size = select(
        'size',
        {
          small: 'small',
          medium: 'medium',
          large: 'large',
        },
        'medium',
      );
      const disabled = boolean('disabled', false);
      const disableRipple = boolean('disableRipple', false);
      const fullWidth = boolean('fullWidth', false);
      return (
        <Button
          color="primary"
          size={size}
          disabled={disabled}
          disableRipple={disableRipple}
          fullWidth={fullWidth}
        >
          Primary
        </Button>
      );
    },
    ));
