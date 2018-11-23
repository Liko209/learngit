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
          <JuiButtonBar size="small" overlapping={true}>
            <JuiCheckboxButton
              tooltipTitle="Add to Favorite"
              checkedIconName="star"
              iconName="star_border"
            >
              star_border
            </JuiCheckboxButton>
            <JuiCheckboxButton
              tooltipTitle="This is a public team"
              checkedIconName="lock"
              iconName="lock_open"
            >
              favorite_border
            </JuiCheckboxButton>
          </JuiButtonBar>}
        Right={
          <JuiButtonBar size="medium" overlapping={true}>
            <JuiIconButton tooltipTitle="Start Conference Call">
              local_phone
            </JuiIconButton>
            <JuiIconButton tooltipTitle="Start Video Call">
              videocam
            </JuiIconButton>
            <JuiIconButton tooltipTitle="Conversation Settings">
              settings
            </JuiIconButton>
          </JuiButtonBar>}
      />
    );
  });
