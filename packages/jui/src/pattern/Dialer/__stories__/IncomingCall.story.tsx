/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2019-03-05 13:45:31
 * Copyright © RingCentral. All rights reserved.
 */

import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { JuiAvatar } from '../../../components/Avatar';
import { JuiFabButton } from '../../../components/Buttons';
import { JuiDraggableDialog } from '../../../components/Dialog';
import avatarImg from '../../../components/Avatar/__stories__/img/avatar.jpg';
import { boolean } from '@storybook/addon-knobs';

import { JuiIncomingCall, JuiDialer, StyledActionText } from '..';

const Ignore = () => (
  <>
    <JuiFabButton
      color="grey.200"
      size="medium"
      iconName="minimize"
      showShadow={false}
    />
    <StyledActionText>Ignore</StyledActionText>
  </>
);

const VoiceMail = () => (
  <>
    <JuiFabButton
      color="semantic.negative"
      size="mediumLarge"
      showShadow={false}
      tooltipPlacement="top"
      iconName="hand_up"
    />
    <StyledActionText>To Voicemail</StyledActionText>
  </>
);

VoiceMail.displayName = 'VoiceMail';

const Answer = () => (
  <>
    <JuiFabButton
      color="semantic.positive"
      size="mediumLarge"
      showShadow={false}
      tooltipPlacement="top"
      iconName="phone"
    />
    <StyledActionText>Answer</StyledActionText>
  </>
);

Answer.displayName = 'Answer';

const More = () => (
  <>
    <JuiFabButton
      color="grey.200"
      size="medium"
      showShadow={false}
      tooltipPlacement="top"
      iconName="call_more"
    />
    <StyledActionText>More</StyledActionText>
  </>
);

More.displayName = 'More';

const Actions = [Ignore, More, VoiceMail, Answer];

const knobs = {
  open: () => boolean('open', false),
  img: () => boolean('open', false),
};

const Avatar = () => (
  <JuiAvatar
    src={knobs.img() ? avatarImg : null}
    cover
    imgProps={{ draggable: false }}
    color="blueberry"
  >
    <span>JH</span>
  </JuiAvatar>
);

storiesOf('Pattern', module).add('Incoming Call', () => {
  return (
    <JuiDialer>
      <JuiIncomingCall
        name="Terry Webster"
        phone="(650) 555-1234"
        Actions={Actions}
        Avatar={Avatar}
      />
    </JuiDialer>
  );
});
