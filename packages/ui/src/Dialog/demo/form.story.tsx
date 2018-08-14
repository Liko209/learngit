import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { withInfo } from '@storybook/addon-info';
import Stepper from './stepper.js';
import { Dialog , DialogActions, DialogHeader, DialogContent, DialogTitle } from '../index';
import {    Button }
  from '@material-ui/core';
import {  boolean  } from '@storybook/addon-knobs';
import styled from 'styled-components';

storiesOf('Dialog', module)
  .addWithJSX('Forms', withInfo(`
      description or documentation about my component, supports markdown

      ~~~js
      <Button>Click Here</Button>
      ~~~

  `)(() => {
    const withTitle = boolean('withTitle', true);
    const content = boolean('content', true);
    const title = <DialogTitle>1213213</DialogTitle>;
    const Leftwrapper = styled.div`
    flex:1
  `;
    return (
        <Dialog
          open={true}
          size={'large'}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
          scroll={'body'}
        >
          <DialogHeader titleComp={withTitle && title}><Stepper/></DialogHeader>
          {content && <DialogContent/>}
          <DialogActions>
          <Leftwrapper > <Button color="primary">Cancel</Button></Leftwrapper>
            <Button color="primary">
              Previous
            </Button>
            <Button variant="contained" color="primary">
             Next
           </Button>
          </DialogActions>
        </Dialog >
    );
  }));
