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

import { JuiIncomingCall, JuiDialer } from '..';

const Ignore = () => (
  <JuiFabButton
    color='common.white'
    size='small'
    iconName='close'
    tooltipTitle='Close'
  />
);

const VoiceMail = () => (
  <JuiFabButton
    color='semantic.negative'
    size='moreLarge'
    showShadow={false}
    tooltipPlacement='top'
    iconName='hand_up'
    tooltipTitle='End'
  />
);

VoiceMail.displayName = 'VoiceMail';

const Answer = () => (
  <JuiFabButton
    color='semantic.positive'
    size='moreLarge'
    showShadow={false}
    tooltipPlacement='top'
    iconName='phone'
    tooltipTitle='Answer'
  />
);

Answer.displayName = 'Answer';

const More = () => (
  <JuiFabButton
    color='grey.200'
    size='moreLarge'
    showShadow={false}
    tooltipPlacement='top'
    iconName='call_more'
    tooltipTitle='More'
  />
);

More.displayName = 'More';

const Actions = [VoiceMail, Answer, More];

const knobs = {
  open: () => boolean('open', false),
  img: () => boolean('open', false),
};

const Avatar = () => (
  <JuiAvatar
    src={knobs.img() ? avatarImg : null}
    cover
    imgProps={{ draggable: false }}
    color='blueberry'
  >
    <span>JH</span>
  </JuiAvatar>
);

storiesOf('Pattern', module).add('Incoming Call', () => {
  return (
    <JuiDialer>
      <JuiIncomingCall
        name='Terry Webster'
        phone='(650) 555-1234'
        Actions={Actions}
        Ignore={Ignore}
        Avatar={Avatar}
      />
    </JuiDialer>
  );
});
