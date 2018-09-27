/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-09-13 10:17:10
 * Copyright © RingCentral. All rights reserved.
 */
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import JuiInput from '../';

storiesOf('Atoms/Input', module).addWithJSX('Input', () => {
  return (
    <div>
      <JuiInput placeholder="placeholder" />
    </div>
  );
});
