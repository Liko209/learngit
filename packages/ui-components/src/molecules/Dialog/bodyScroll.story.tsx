import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { withInfo } from '@storybook/addon-info';

import { Typography, DialogActions, Button } from '@material-ui/core';
import Dialog from '../../atoms/Dialog';
import DialogTitle from '../../atoms/DialogTitle';
import DialogHeader from '../../atoms/DialogHeader';
import { randomText } from './utils';
import { withInfoDecorator } from '../../utils/decorators';

storiesOf('Molecules/Dialog 🔜', module)
  .addDecorator(withInfoDecorator(Dialog))
  .addWithJSX('Body scroll', () => {
    return (
      <Dialog
        open={true}
        size={'medium'}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        scroll={'body'}
      >
        <DialogHeader titleComp={<DialogTitle>Headline</DialogTitle>}>
          <Typography align="justify" variant="body1">
            {randomText}
          </Typography>
        </DialogHeader>
        <DialogActions>
          <Button color="primary">
            Agree
            </Button>
        </DialogActions>
      </Dialog>
    );
  });
