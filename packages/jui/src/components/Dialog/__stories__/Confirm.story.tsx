import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { boolean } from '@storybook/addon-knobs';
import Dialog from '../Dialog';
import JuiComfirm from '../Confirm';
import { withInfoDecorator } from '../../../foundation/utils/decorators';

storiesOf('Component/Dialog 🔜', module)
  .addDecorator(withInfoDecorator(Dialog))
  .addWithJSX('Confirm', () => {
    const open = boolean('open', true);
    const onOk = () => {};
    const onClose = () => {};
    return (
      <JuiComfirm
        open={open}
        header="Comfirm header"
        onOk={onOk}
        onClose={onClose}
      >
        Are you sure delete it?
      </JuiComfirm>
    );
  });
