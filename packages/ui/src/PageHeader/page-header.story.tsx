/// <reference path="../../.storybook/storybook.d.ts" />
import * as React from 'react';
import { storiesOf } from '@storybook/react';
// import { boolean, select } from '@storybook/addon-knobs/react';
import { withInfo } from '@storybook/addon-info';
import backgrounds from '@storybook/addon-backgrounds';
import PageHeader from '.';
import Typography from '../Typography';
// import IconButton from '../IconButton/index';
import Icon from '@material-ui/core/Icon';
import Button from '../Button';
import IconButton from '../IconButton';

storiesOf('PageHeader', module)
  .addDecorator(
    backgrounds([{ name: 'slide-background', value: '#f3f3f3', default: true }]),
)
  .addWithJSX(
    'Simple',
    withInfo(``)(() => {
      return [
        (
          <PageHeader key="1">
            <div style={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
              <Typography color="textSecondary" variant="title">
                About this conversation
              </Typography>
            </div>
          </PageHeader>
        ),
        (<br />),
        (
          <PageHeader key="2">
            <div style={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
              <Icon color="primary">home</Icon>
              <Typography
                color="textSecondary"
                variant="title"
                style={{ paddingLeft: '10px' }}
              >
                About this conversation
              </Typography>
            </div>
          </PageHeader>
        ),
        (<br />),
        (
          <PageHeader key="3">
            <div style={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
              <Typography
                color="textSecondary"
                variant="title"
                style={{ paddingLeft: '10px' }}
              >
                About this conversation
              </Typography>
            </div>
            <div>
              <IconButton>
                <Icon color="primary">home</Icon>
              </IconButton>
              <IconButton>
                <Icon color="primary">favorite</Icon>
              </IconButton>
            </div>
          </PageHeader>
        ),
        (<br />),
        (
          <PageHeader key="4">
            <div style={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
              <IconButton>
                <Icon color="primary">keyboard_arrow_left</Icon>
              </IconButton>
              <Typography
                color="textSecondary"
                variant="title"
                style={{ paddingRight: '12px', paddingLeft: '10px' }}
              >
                About this conversation
              </Typography>
              <IconButton>
                <Icon color="primary">star_border</Icon>
              </IconButton>
            </div>
            <div>
              <Button variant="outlined">Button</Button>
            </div>
          </PageHeader>
        ),
      ];
    }),
);
