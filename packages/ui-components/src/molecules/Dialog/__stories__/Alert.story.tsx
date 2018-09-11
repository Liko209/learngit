import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { boolean } from '@storybook/addon-knobs';
import Dialog from '../../../atoms/Dialog';
import JuiAlert from '../Alert';
import { withInfoDecorator } from '../../../utils/decorators';

storiesOf('Molecules/Dialog 🔜', module)
  .addDecorator(withInfoDecorator(Dialog))
  .addWithJSX('Alert', () => {
    const open = boolean('open', true);
    const onClose = () => { };
    return (
      <JuiAlert open={open} header="Alert header" onClose={onClose}>
        We are having trouble signing you in. Please try again later.
      </JuiAlert>
    );
  });
