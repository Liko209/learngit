import React from 'react';
import { storiesOf } from '@storybook/react';
import { withInfo } from '@storybook/addon-info';
import ContactList from './contact.list';
import Dialog from '../../atoms/Dialog';
import DialogHeader from '../../atoms/DialogHeader';
import DialogTitle from '../../atoms/DialogTitle';

storiesOf('Dialog', module)
  .addWithJSX('Simple Popup', withInfo(`
      description or documentation about my component, supports markdown
      ~~~js
      <Button>Click Here</Button>
      ~~~
  `)(() => {
    return (
      <Dialog
        open={true}
        size={'sm'}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        scroll={'paper'}
      >
    <DialogHeader titleComp={<DialogTitle>Headline</DialogTitle>}>
      <ContactList/>
    </DialogHeader>
      </Dialog>
    );
  }));
