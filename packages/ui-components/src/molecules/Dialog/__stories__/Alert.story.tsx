import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { boolean } from '@storybook/addon-knobs';
import Dialog from '../../../atoms/Dialog';
import JuiModal from '../Modal';
import { withInfoDecorator } from '../../../utils/decorators';
import { noop } from '../../../utils';

storiesOf('Molecules/Dialog 🔜', module)
  .addDecorator(withInfoDecorator(Dialog))
  .addWithJSX('Alert', () => {
    const open = boolean('open', true);
    const onCancel = () => {
      alert('you clicked cancel');
    };
    const onOK = () => {
      alert('you clicked OK');
    };
    return (
      <JuiModal
        open={open}
        header="Alert header"
        okCancel={true}
        onCancel={onCancel}
        onOK={onOK}
      >
        We are having trouble signing you in. Please try again later.
      </JuiModal>
    );
  });
