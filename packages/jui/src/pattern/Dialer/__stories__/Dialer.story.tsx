/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2019-03-05 13:45:31
 * Copyright © RingCentral. All rights reserved.
 */

import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { JuiIconography } from '../../../foundation/Iconography';
import { withInfoDecorator } from '../../../foundation/utils/decorators';
import { JuiAvatar } from '../../../components/Avatar';
import { JuiIconButton, JuiFabButton } from '../../../components/Buttons';
import { JuiDraggableDialog } from '../../../components/Dialog';
import avatarImg from '../../../components/Avatar/__stories__/img/avatar.jpg';
import { boolean } from '@storybook/addon-knobs';

import {
  JuiTitleBar,
  JuiHeader,
  JuiHeaderContainer,
  JuiContainer,
  JuiDialer,
  JuiKeypadAction,
} from '..';

const Status = () => <JuiIconography iconSize="large">signal_2</JuiIconography>;

const MinimizeAction = () => (
  <JuiIconButton
    size="small"
    tooltipTitle="Minimize"
    variant="plain"
    color="common.white"
  >
    minimize
  </JuiIconButton>
);

const DetachOrAttachAction = () => (
  <JuiIconButton
    size="small"
    tooltipTitle="Detach"
    variant="plain"
    color="common.white"
  >
    tear_off
  </JuiIconButton>
);

const Actions = [DetachOrAttachAction, MinimizeAction];

const Avatar = () => <JuiAvatar size="medium" src={avatarImg} />;

const Back = () => (
  <JuiIconButton
    size="small"
    tooltipTitle="Back"
    variant="plain"
    color="common.white"
  >
    previous
  </JuiIconButton>
);

const HoverActions = () => (
  <JuiIconButton
    size="large"
    tooltipTitle="Messages"
    variant="plain"
    color="common.white"
  >
    messages
  </JuiIconButton>
);

const End = () => (
  <JuiFabButton
    color="semantic.negative"
    disableToolTip={true}
    size="moreLarge"
    showShadow={false}
    tooltipPlacement="top"
    iconName="hand_up"
  />
);

const knobs = {
  open: () => boolean('open', false),
};

const MuteAction = () => (
  <JuiKeypadAction>
    <JuiIconButton color="grey.900" disableToolTip={true} size="xxlarge">
      mic
    </JuiIconButton>
    <span>Mute</span>
  </JuiKeypadAction>
);

const KeypadAction = () => (
  <JuiKeypadAction>
    <JuiIconButton color="grey.900" disableToolTip={true} size="xxlarge">
      keypad
    </JuiIconButton>
    <span>Keypad</span>
  </JuiKeypadAction>
);

const HoldAction = () => (
  <JuiKeypadAction>
    <JuiIconButton color="grey.900" disableToolTip={true} size="xxlarge">
      hold
    </JuiIconButton>
    <span>Hold</span>
  </JuiKeypadAction>
);

const AddAction = () => (
  <JuiKeypadAction>
    <JuiIconButton color="grey.900" disableToolTip={true} size="xxlarge">
      call_add
    </JuiIconButton>
    <span>Add</span>
  </JuiKeypadAction>
);

const RecordAction = () => (
  <JuiKeypadAction>
    <JuiIconButton color="grey.900" disableToolTip={true} size="xxlarge">
      record
    </JuiIconButton>
    <span>Record</span>
  </JuiKeypadAction>
);

const CallActionsAction = () => (
  <JuiKeypadAction>
    <JuiIconButton color="grey.900" disableToolTip={true} size="xxlarge">
      call_more
    </JuiIconButton>
    <span>Call Actions</span>
  </JuiKeypadAction>
);

const KeypadActions = [
  MuteAction,
  KeypadAction,
  HoldAction,
  AddAction,
  RecordAction,
  CallActionsAction,
];

storiesOf('Pattern', module)
  .addDecorator(withInfoDecorator(JuiTitleBar, { inline: true }))
  .add('Dialer', () => {
    return (
      <JuiDraggableDialog open={knobs.open()} x={0} y={0}>
        <JuiDialer>
          <JuiHeaderContainer>
            <JuiTitleBar label="02:32" Actions={Actions} Status={Status} />
            <JuiHeader
              Avatar={Avatar}
              name="Terry Webster"
              phone="(650) 555-12345"
              Back={Back}
              HoverActions={HoverActions}
            />
          </JuiHeaderContainer>
          <JuiContainer End={End} KeypadActions={KeypadActions} />
        </JuiDialer>
      </JuiDraggableDialog>
    );
  });
