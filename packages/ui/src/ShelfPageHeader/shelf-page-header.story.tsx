/// <reference path="../../.storybook/storybook.d.ts" />
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { withInfo } from '@storybook/addon-info';
import { text } from '@storybook/addon-knobs/react';
import ShelfPageHeader from '.';
import { IconButton } from '../IconButton/index';

const getTitleKnob = () => text('title', 'Global UXD');
storiesOf('Page Header (Shelf)', module)
  .addWithJSX('title only', withInfo(``)(() => {
    return <ShelfPageHeader title={getTitleKnob()} />;
  }))
  .addWithJSX('with right slot', withInfo(``)(() => {
    const rightIcon = <IconButton awake={true} tooltipTitle="Close">close</IconButton>;
    return (
      <ShelfPageHeader
        title={getTitleKnob()}
        rightSlot={rightIcon}
      />
    );
  }))
  .addWithJSX('with left slot', withInfo(``)(() => {
    const leftIcon = <IconButton awake={true}>keyboard_arrow_left</IconButton>;
    return <ShelfPageHeader title={getTitleKnob()} leftSlot={leftIcon} />;
  }));
