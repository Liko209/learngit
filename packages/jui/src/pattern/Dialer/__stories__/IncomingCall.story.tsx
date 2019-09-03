/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2019-03-05 13:45:31
 * Copyright © RingCentral. All rights reserved.
 */

import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { JuiAvatar } from '../../../components/Avatar';
import { JuiFabButton, JuiIconButton } from '../../../components/Buttons';
import { JuiDraggableDialog } from '../../../components/Dialog';
import avatarImg from '../../../components/Avatar/__stories__/img/avatar.jpg';
import { boolean } from '@storybook/addon-knobs';

import {
  JuiIncomingCall,
  JuiDialer,
  StyledActionText,
  JuiEndAndAnswer,
} from '..';

const Ignore = () => (
  <>
    <JuiFabButton
      color="grey.200"
      size="medium"
      iconName="ignore"
      showShadow={false}
    />
    <StyledActionText>Ignore</StyledActionText>
  </>
);

Ignore.displayName = 'Ignore';

const VoiceMail = () => (
  <>
    <JuiFabButton
      color="semantic.negative"
      size="mediumLarge"
      showShadow={false}
      tooltipPlacement="top"
      iconName="voicemail"
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
      iconName="answer"
    />
    <StyledActionText>Answer</StyledActionText>
  </>
);

Answer.displayName = 'Answer';

const EndAndAnswer = () => (
  <>
    <JuiEndAndAnswer />
    <StyledActionText>End & Answer</StyledActionText>
  </>
);

EndAndAnswer.displayName = 'EndAndAnswer';

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
const MultipleActions = [Ignore, More, EndAndAnswer, VoiceMail];

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

storiesOf('Pattern', module).add('Multiple Incoming Call', () => {
  return (
    <JuiDialer>
      <JuiIncomingCall
        name="Terry Webster"
        phone="(650) 555-1234"
        Actions={MultipleActions}
        Avatar={Avatar}
      />
    </JuiDialer>
  );
});
