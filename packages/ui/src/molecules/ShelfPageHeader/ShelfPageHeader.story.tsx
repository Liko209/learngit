/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-08-22 15:23:33
 * Copyright © RingCentral. All rights reserved.
 */
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
        Right={rightIcon}
      />
    );
  }))
  .addWithJSX('with left slot', withInfo(``)(() => {
    const leftIcon = <IconButton variant="plain" awake={true}>keyboard_arrow_left</IconButton>;
    return <ShelfPageHeader title={getTitleKnob()} Left={leftIcon} />;
  }));
