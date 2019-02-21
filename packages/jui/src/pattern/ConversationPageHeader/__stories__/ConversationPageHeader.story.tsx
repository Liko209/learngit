/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-08-22 15:23:24
 * Copyright © RingCentral. All rights reserved.
 */
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import backgrounds from '@storybook/addon-backgrounds';
import { text } from '@storybook/addon-knobs';
import { JuiIconButton } from '../../../components/Buttons/IconButton';
import { withInfoDecorator } from '../../../foundation/utils/decorators';
import { JuiConversationPageHeader } from '../ConversationPageHeader';
import { JuiButtonBar } from '../../../components/Buttons/ButtonBar';
import { JuiCheckboxButton } from '../../../components/Buttons/CheckboxButton';

const getTitleKnob = () => text('title', 'Global UXD');
const getStatusKnob = () => text('status', '🏝on vacation 10/16-10/24');
storiesOf('Pattern', module)
  .addDecorator(withInfoDecorator(JuiConversationPageHeader, { inline: true }))
  .addDecorator(
    backgrounds([{ name: 'slide-background', value: '#f3f3f3', default: true }]),
  )
  .add('ConversationPageHeader', () => {
    return (
      <JuiConversationPageHeader
        title={getTitleKnob()}
        status={getStatusKnob()}
        SubTitle={
          <JuiButtonBar overlapSize={2}>
            <JuiCheckboxButton
              tooltipTitle="This is a public team"
              checkedIconName="lock"
              color="grey.500"
              iconName="lock_open"
            />
            <JuiCheckboxButton
              tooltipTitle="Add to Favorite"
              color="accent.gold"
              checkedIconName="star"
              iconName="star_border"
            />
          </JuiButtonBar>}
        Right={
          <JuiButtonBar overlapSize={1}>
            <JuiIconButton tooltipTitle="Start Conference Call">
              phone
            </JuiIconButton>
            <JuiIconButton tooltipTitle="Start Video Call">
              meetings
            </JuiIconButton>
            <JuiIconButton tooltipTitle="Conversation Settings">
              settings
            </JuiIconButton>
          </JuiButtonBar>}
      />
    );
  });
