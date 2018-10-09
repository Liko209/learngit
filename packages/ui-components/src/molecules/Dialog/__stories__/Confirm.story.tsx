import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { boolean } from '@storybook/addon-knobs';
import Dialog from '../../../atoms/Dialog';
import JuiConfirm from '../Confirm';
import { withInfoDecorator } from '../../../utils/decorators';

storiesOf('Molecules/Dialog 🔜', module)
  .addDecorator(withInfoDecorator(Dialog))
  .addWithJSX('Confirm', () => {
    const open = boolean('open', true);
    const onOk = () => {};
    const onClose = () => {};
    return (
      <JuiConfirm
        open={open}
        header="Confirm header"
        onOk={onOk}
        onClose={onClose}
      >
        Are you sure delete it?
      </JuiConfirm>
    );
  });
