/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-08-22 15:23:24
 * Copyright © RingCentral. All rights reserved.
 */
/// <reference path="../../../../.storybook/storybook.d.ts" />
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import backgrounds from '@storybook/addon-backgrounds';
import { text } from '@storybook/addon-knobs/react';
import { JuiIconButton } from '../../IconButton';
import { withInfoDecorator } from '../../../utils/decorators';
import JuiConversationPageHeader from '../ConversationPageHeader';
import JuiButtonBar from '../../../molecules/ButtonBar/ButtonBar';
import { JuiCheckboxButton } from '../../CheckboxButton';

const getTitleKnob = () => text('title', 'Global UXD');
storiesOf('Molecules/ConversationPageHeader', module)
  .addDecorator(withInfoDecorator(JuiConversationPageHeader, { inline: true }))
  .addDecorator(
    backgrounds([{ name: 'slide-background', value: '#f3f3f3', default: true }]),
  )
  .addWithJSX('normal', () => {
    return (
      <JuiConversationPageHeader
        title={getTitleKnob()}
        SubTitle={
          <JuiButtonBar size="small" overlapping={true}>
            <JuiCheckboxButton tooltipTitle="Add to Favorite" checkedIconName="star" iconName="star_border">star_border</JuiCheckboxButton>
            <JuiCheckboxButton tooltipTitle="This is a public team" checkedIconName="lock" iconName="lock_open">favorite_border</JuiCheckboxButton>
          </JuiButtonBar>}
        Right={
          <JuiButtonBar size="medium" overlapping={true}>
            <JuiIconButton tooltipTitle="Start Conference Call">local_phone</JuiIconButton>
            <JuiIconButton tooltipTitle="Start Video Call">videocam</JuiIconButton>
            <JuiIconButton tooltipTitle="Conversation Settings">settings</JuiIconButton>
          </JuiButtonBar>}
      />
    );
  });
