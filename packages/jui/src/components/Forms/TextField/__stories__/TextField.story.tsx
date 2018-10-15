/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-09-17 15:03:20
 * Copyright © RingCentral. All rights reserved.
 */
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { boolean } from '@storybook/addon-knobs';
import { withInfoDecorator } from '../../../../foundation/utils/decorators';

import { JuiTextField } from '../';

storiesOf('Components/Forms', module)
  .addDecorator(withInfoDecorator(JuiTextField, { inline: true }))
  .add('TextField', () => {
    return (
      <JuiTextField
        id="Team name"
        label="Team name"
        fullWidth={true}
        InputProps={{
          classes: {
            root: 'root',
          },
        }}
        inputProps={{
          maxLength: 200,
        }}
        helperText={'Team name required'}
      />
    );
  });
