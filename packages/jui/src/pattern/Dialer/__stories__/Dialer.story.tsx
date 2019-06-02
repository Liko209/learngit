/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2019-03-05 13:45:31
 * Copyright © RingCentral. All rights reserved.
 */

import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { JuiIconography } from '../../../foundation/Iconography';
import { JuiAvatar } from '../../../components/Avatar';
import { JuiIconButton, JuiFabButton } from '../../../components/Buttons';
import avatarImg from '../../../components/Avatar/__stories__/img/avatar.jpg';
import { boolean } from '@storybook/addon-knobs';
import minimize from '../../../assets/jupiter-icon/icon-minimize.svg';
import tearOff from '../../../assets/jupiter-icon/icon-tear-off.svg';
import signal2 from '../../../assets/jupiter-icon/icon-signal-2.svg';
import previous from '../../../assets/jupiter-icon/icon-previous.svg';
import mic from '../../../assets/jupiter-icon/icon-mic.svg';
import keypad from '../../../assets/jupiter-icon/icon-keypad.svg';
import hold from '../../../assets/jupiter-icon/icon-hold.svg';
import callAdd from '../../../assets/jupiter-icon/icon-call-add.svg';
import record from '../../../assets/jupiter-icon/icon-record.svg';
import callMore from '../../../assets/jupiter-icon/icon-call-more.svg';

import {
  JuiTitleBar,
  JuiHeader,
  JuiHeaderContainer,
  JuiContainer,
  JuiDialer,
  JuiKeypadAction,
} from '..';

const Status = () => <JuiIconography iconSize="large" symbol={signal2} />;

const MinimizeAction = () => (
  <JuiIconButton
    size="small"
    tooltipTitle="Minimize"
    variant="plain"
    color="common.white"
    symbol={minimize}
  />
);

MinimizeAction.displayName = 'MinimizeAction';

const DetachOrAttachAction = () => (
  <JuiIconButton
    size="small"
    tooltipTitle="Detach"
    variant="plain"
    color="common.white"
    symbol={tearOff}
  />
);

DetachOrAttachAction.displayName = 'DetachOrAttachAction';

const Actions = [DetachOrAttachAction, MinimizeAction];

const Avatar = () => <JuiAvatar size="medium" src={avatarImg} />;

const Back = () => (
  <JuiIconButton
    size="small"
    tooltipTitle="Back"
    variant="plain"
    color="common.white"
    symbol={previous}
  />
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
    <JuiIconButton
      color="grey.900"
      disableToolTip={true}
      size="xxlarge"
      symbol={mic}
    />
    <span>Mute</span>
  </JuiKeypadAction>
);

MuteAction.displayName = 'MuteAction';

const KeypadAction = () => (
  <JuiKeypadAction>
    <JuiIconButton
      color="grey.900"
      disableToolTip={true}
      size="xxlarge"
      symbol={keypad}
    />
    <span>Keypad</span>
  </JuiKeypadAction>
);

KeypadAction.displayName = 'KeypadAction';

const HoldAction = () => (
  <JuiKeypadAction>
    <JuiIconButton
      color="grey.900"
      disableToolTip={true}
      size="xxlarge"
      symbol={hold}
    />
    <span>Hold</span>
  </JuiKeypadAction>
);

HoldAction.displayName = 'HoldAction';

const AddAction = () => (
  <JuiKeypadAction>
    <JuiIconButton
      color="grey.900"
      disableToolTip={true}
      size="xxlarge"
      symbol={callAdd}
    />
    <span>Add</span>
  </JuiKeypadAction>
);

AddAction.displayName = 'AddAction';

const RecordAction = () => (
  <JuiKeypadAction>
    <JuiIconButton
      color="grey.900"
      disableToolTip={true}
      size="xxlarge"
      symbol={record}
    />
    <span>Record</span>
  </JuiKeypadAction>
);

RecordAction.displayName = 'RecordAction';

const CallActionsAction = () => (
  <JuiKeypadAction>
    <JuiIconButton
      color="grey.900"
      disableToolTip={true}
      size="xxlarge"
      symbol={callMore}
    />
    <span>Call Actions</span>
  </JuiKeypadAction>
);

CallActionsAction.displayName = 'CallActionsAction';

const KeypadActions = [
  MuteAction,
  KeypadAction,
  HoldAction,
  AddAction,
  RecordAction,
  CallActionsAction,
];

storiesOf('Pattern', module).add('Dialer', () => {
  return (
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
      <JuiContainer CallAction={End} KeypadActions={KeypadActions} />
    </JuiDialer>
  );
});
