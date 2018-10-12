/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-10-11 14:36:08
 * Copyright © RingCentral. All rights reserved.
 */
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { boolean } from '@storybook/addon-knobs';
import { withInfoDecorator } from '../../../foundation/utils/decorators';
import { JuiConfirm } from '../Confirm1';

storiesOf('Components/Dialog 🔜', module).addWithJSX('JuiConfirm', () => {
  const open = boolean('open', true);

  const ok = () => alert('ok');
  const cancel = () => alert('cancel');
  return (
    <div>
      <JuiConfirm
        open={open}
        title={'title'}
        onOK={ok}
        onCancel={cancel}
        content={'content'}
        okText="OK"
        cancelText="Cancel"
      />
    </div>
  );
});
