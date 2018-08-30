import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { withInfo } from '@storybook/addon-info';
import { Button, Typography } from '@material-ui/core';
import { select, boolean  } from '@storybook/addon-knobs';
import DialogTitle from '../../atoms/DialogTitle';
import DialogHeader from '../../atoms/DialogHeader';
import DialogActions from '../../atoms/DialogAction';
import Dialog from '../../atoms/Dialog';

storiesOf('Dialog', module)
  .addWithJSX('Alert and Confirmation', withInfo(`
      description or documentation about my component, supports markdown

      ~~~js
      <Button>Click Here</Button>
      ~~~

  `)(() => {
    const size = select(
        'size', {
          sm: 'sm',
          md: 'md',
          lg: 'lg',
          fullScreen:'fullScreen',
        },
        'sm',
      );
    const scroll = select(
        'scroll',
        { body: 'body', paper: 'paper' },
        'body',
      );
    const withTitle = boolean('with Headline', true);
    const open = boolean('open', true);
    const title = <DialogTitle>HeadLine</DialogTitle>;
    return (
        <Dialog
          open={open}
          size={size}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
          scroll={scroll}
        >
          <DialogHeader titleComp={withTitle && title}>
          <Typography variant="body2" gutterBottom={true}>
        This is a prompt ....
      </Typography></DialogHeader>
          <DialogActions>
            <Button color="primary">
              Disagree
            </Button>
            <Button color="primary" autoFocus={true}>
              Agree
            </Button>
          </DialogActions>
        </Dialog>
    );
  }));
