/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-09-11 16:00:15
 * Copyright © RingCentral. All rights reserved.
 */
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { boolean } from '@storybook/addon-knobs/react';
import {
  withInfoDecorator,
  alignCenterDecorator,
} from '../../../utils/decorators';
import JuiSwitchButton from '../';

function getKnobs() {
  const disabled = boolean('disabled', false);
  return {
    disabled,
  };
}

storiesOf('Molecules/SwitchButton', module).addWithJSX('SwitchButton', () => {
  return <JuiSwitchButton disabled={getKnobs().disabled} />;
});
