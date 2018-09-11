/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-09-11 16:00:15
 * Copyright © RingCentral. All rights reserved.
 */
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { boolean, select, text } from '@storybook/addon-knobs/react';
import { withInfoDecorator, alignCenterDecorator } from '../../../utils/decorators';
import JuiSwitchButton from '../';

storiesOf('Molecules/SwitchButton', module)
  .addWithJSX('SwitchButton', () => {
    return (
      <JuiSwitchButton />
    );
  });
