import React from 'react';
import { storiesOf } from '@storybook/react';
import { withInfo } from '@storybook/addon-info';
import { Dialog , DialogHeader, DialogTitle } from '..';
// import { Button, Typography } from '@material-ui/core';
import ContactList from './contact.list';
// import { select, boolean  } from '@storybook/addon-knobs';

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
