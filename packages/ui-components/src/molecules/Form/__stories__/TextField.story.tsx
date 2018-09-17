/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-09-17 15:03:20
 * Copyright © RingCentral. All rights reserved.
 */
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { boolean } from '@storybook/addon-knobs/react';

import TextField from '../TextField';

storiesOf('Molecules/Forms', module).addWithJSX('TextField', () => {
  return (
    <TextField
      id="Team name"
      label="Team name"
      fullWidth={true}
      inputProps={{
        maxlength: 200,
      }}
      InputProps={{
        classes: {
          underline: 'underline',
        },
      }}
      helperText={'Team name required'}
    />
  );
});
