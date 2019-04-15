/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-09-11 16:00:15
 * Copyright © RingCentral. All rights reserved.
 */
// tslint:disable:no-console
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { boolean } from '@storybook/addon-knobs';

import { JuiToggleButton } from '../';

function getKnobs() {
  const disabled = boolean('disabled', false);
  return {
    disabled,
  };
}

storiesOf('Components/Buttons', module).add('ToggleButton', () => {
  const onChange = (checked: any) => console.log(checked);
  return <JuiToggleButton onChange={onChange} disabled={getKnobs().disabled} />;
});
