/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-09-12 15:09:41
 * Copyright © RingCentral. All rights reserved.
 */
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { boolean } from '@storybook/addon-knobs';
import JuiCreateTeam from '../';
import { withInfoDecorator } from '../../../utils/decorators';

storiesOf('Molecules/CreateTeam 🔜', module).addWithJSX('CreateTeam', () => {
  const open = boolean('open', true);
  const onClose = () => {};
  const onCancel = () => {};

  return (
    <JuiCreateTeam
      open={open}
      header="New Team"
      onCancel={onCancel}
      onClose={onClose}
    />
  );
});
