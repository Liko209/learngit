/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-09-17 15:03:20
 * Copyright © RingCentral. All rights reserved.
 */
// tslint:disable:no-console
import * as React from 'react';
import { storiesOf } from '@storybook/react';

import { JuiTextarea } from '..';

storiesOf('Components/Forms', module).add('Textarea', () => {
  const onChange = (e: React.ChangeEvent) => {
    console.log(e);
  };
  return (
    <JuiTextarea
      id='New Message'
      label='New Message'
      placeholder='placeholder'
      fullWidth
      onChange={onChange}
    />
  );
});
