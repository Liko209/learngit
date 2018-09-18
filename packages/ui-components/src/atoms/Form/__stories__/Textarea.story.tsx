/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-09-17 15:03:20
 * Copyright © RingCentral. All rights reserved.
 */
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { boolean } from '@storybook/addon-knobs/react';

import Textarea from '../Textarea';

storiesOf('Atoms/Forms', module).addWithJSX('Textarea', () => {
  return <Textarea placeholder="sdfsdf" fullWidth={true} />;
});
