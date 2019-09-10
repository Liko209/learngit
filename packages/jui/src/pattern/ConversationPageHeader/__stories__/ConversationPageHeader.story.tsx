/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-08-22 15:23:24
 * Copyright © RingCentral. All rights reserved.
 */
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { text } from '@storybook/addon-knobs';
import { JuiIconButton } from '../../../components/Buttons/IconButton';
import { JuiConversationPageHeader } from '../ConversationPageHeader';
import { JuiButtonBar } from '../../../components/Buttons/ButtonBar';
import { JuiCheckboxButton } from '../../../components/Buttons/CheckboxButton';
import phone from '../../../assets/jupiter-icon/icon-phone.svg';
import meetings from '../../../assets/jupiter-icon/icon-videocam.svg';
import setting from '../../../assets/jupiter-icon/icon-settings.svg';

const getTitleKnob = () => text('title', 'Global UXD');
const getStatusKnob = () => text('status', 'on vacation 10/16-10/24');
const getStatusEmoji = () => text('emoji', ':joy:');

storiesOf('Pattern', module).add('ConversationPageHeader', () => {
  return (
    <JuiConversationPageHeader
      title={getTitleKnob()}
      colonsEmoji={getStatusEmoji()}
      statusPlainText={getStatusKnob()}
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
        </JuiButtonBar>
      }
      Right={
        <JuiButtonBar overlapSize={1}>
          <JuiIconButton tooltipTitle="Start Conference Call" symbol={phone} />
          <JuiIconButton tooltipTitle="Start Video Call" symbol={meetings} />
          <JuiIconButton
            tooltipTitle="Conversation Settings"
            symbol={setting}
          />
        </JuiButtonBar>
      }
    />
  );
});
