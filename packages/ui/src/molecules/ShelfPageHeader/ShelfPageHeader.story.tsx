/// <reference path="../../../.storybook/storybook.d.ts" />
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { withInfo } from '@storybook/addon-info';
import { text } from '@storybook/addon-knobs/react';
import ShelfPageHeader from '.';
import { IconButton } from '../IconButton/index';

const getTitleKnob = () => text('title', 'Global UXD');
storiesOf('ShelfPageHeader', module)
  .addWithJSX('title only', withInfo(``)(() => {
    return <ShelfPageHeader title={getTitleKnob()} />;
  }))
  .addWithJSX('with right slot', withInfo(``)(() => {
    const rightIcon = (
      <IconButton
        variant="plain"
        awake={true}
        tooltipTitle="Close"
      >
        close
      </IconButton>
    );
    return (
      <ShelfPageHeader
        title={getTitleKnob()}
        rightSection={rightIcon}
      />
    );
  }))
  .addWithJSX('with left slot', withInfo(``)(() => {
    const leftIcon = <IconButton variant="plain" awake={true}>keyboard_arrow_left</IconButton>;
    return <ShelfPageHeader title={getTitleKnob()} leftSection={leftIcon} />;
  }));
