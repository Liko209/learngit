import React from 'react';
import { storiesOf } from '@storybook/react';
import { withInfo } from '@storybook/addon-info';
import ContactList from './../contact.list';
import Dialog from '../../../atoms/Dialog';
import DialogHeader from '../../../atoms/DialogHeader';
import DialogTitle from '../../../atoms/DialogTitle';
import { withInfoDecorator } from '../../../utils/decorators';

storiesOf('Molecules/Dialog 🔜', module)
  .addDecorator(withInfoDecorator(Dialog))
  .addWithJSX('Simple Popup', () => {
    return (
      <Dialog
        open={true}
        size={'small'}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        scroll={'paper'}
      >
        <DialogHeader titleComp={<DialogTitle>Headline</DialogTitle>}>
          <ContactList />
        </DialogHeader>
      </Dialog>
    );
  });
