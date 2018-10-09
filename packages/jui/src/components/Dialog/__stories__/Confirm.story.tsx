import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { boolean } from '@storybook/addon-knobs';
import { JuiDialog } from '../Dialog';
import { JuiConfirm } from '../Confirm';
import { withInfoDecorator } from '../../../foundation/utils/decorators';

storiesOf('Components/Dialog 🔜', module)
  .addDecorator(withInfoDecorator(JuiDialog))
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
