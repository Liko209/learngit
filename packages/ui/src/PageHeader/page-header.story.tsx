/// <reference path="../../.storybook/storybook.d.ts" />
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { withInfo } from '@storybook/addon-info';
import backgrounds from '@storybook/addon-backgrounds';
import PageHeader from '.';
import Typography from '../Typography';
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
      const left1 = (
        <Typography color="textSecondary" variant="title">
          About this conversation
    </Typography>
      );
      const left2 = [
        <Icon color="primary" key="1">home</Icon>,
        (
          <Typography
            key="2"
            color="textSecondary"
            variant="title"
            style={{ paddingLeft: '10px' }}
          >
            About this conversation
          </Typography>
        ),
      ];
      const left3 = (
        <Typography
          color="textSecondary"
          variant="title"
          style={{ paddingLeft: '10px' }}
        >
          About this conversation
        </Typography>
      );
      const right3 = [
        (
          <IconButton>
            <Icon color="primary">home</Icon>
          </IconButton>
        ),
        (
          <IconButton>
            <Icon color="primary">favorite</Icon>
          </IconButton>
        ),
      ];
      const left4 = [
        (
          <IconButton>
            <Icon color="primary">keyboard_arrow_left</Icon>
          </IconButton>
        ),
        (
          <Typography
            color="textSecondary"
            variant="title"
            style={{ paddingRight: '12px', paddingLeft: '10px' }}
          >
            About this conversation
          </Typography>
        ),
        (
          <IconButton>
            <Icon color="primary">star_border</Icon>
          </IconButton>
        ),
      ];
      const right4 = <Button variant="outlined">Button</Button>;
      return [
        <PageHeader key="1" leftSlot={left1} />,
        <br key="1.5" />,
        <PageHeader key="2" leftSlot={left2} />,
        <br key="2.5" />,
        <PageHeader key="3" leftSlot={left3} rightSlot={right3} />,
        <br key="3.5" />,
        <PageHeader key="4" leftSlot={left4} rightSlot={right4} />,
      ];
    }),
);
