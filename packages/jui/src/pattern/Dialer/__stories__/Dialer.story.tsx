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
import { boolean, text } from '@storybook/addon-knobs';
import minimize from '../../../assets/jupiter-icon/icon-minimize.svg';
import tearOff from '../../../assets/jupiter-icon/icon-tear-off.svg';
import signal2 from '../../../assets/jupiter-icon/icon-signal-2.svg';
import previous from '../../../assets/jupiter-icon/icon-previous.svg';
import mic from '../../../assets/jupiter-icon/icon-mic.svg';
import dialer from '../../../assets/jupiter-icon/icon-dialer.svg';
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
  JuiSwitchCallChip,
  JuiSwitchCallHeader,
} from '..';

const Status = () => <JuiIconography iconSize="large" symbol={signal2} />;

const MinimizeAction = () => (
  <JuiIconButton
    key="MinimizeAction"
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
    key="DetachOrAttachAction"
    size="small"
    tooltipTitle="Detach"
    variant="plain"
    color="common.white"
    symbol={tearOff}
  />
);

DetachOrAttachAction.displayName = 'DetachOrAttachAction';

const Actions = [DetachOrAttachAction, MinimizeAction];

const Avatar = () => <JuiAvatar size="large" src={avatarImg} />;

const Back = () => (
  <JuiIconButton
    tooltipTitle="Back"
    size="large"
    variant="plain"
    color="common.white"
    symbol={previous}
  />
);

const End = () => (
  <JuiFabButton
    color="semantic.negative"
    disableToolTip
    size="moreLarge"
    showShadow={false}
    tooltipPlacement="top"
    iconName="hand_up"
  />
);

const Transfer = () => (
  <JuiFabButton
    color="semantic.positive"
    disableToolTip
    size="moreLarge"
    showShadow={false}
    tooltipPlacement="top"
    iconName="transfer-call"
  />
);

const knobs = {
  open: () => boolean('open', false),
};

const MuteAction = () => (
  <JuiKeypadAction key="muteAction">
    <JuiIconButton
      color="grey.900"
      disableToolTip
      size="xxlarge"
      symbol={mic}
    />
    <span>Mute</span>
  </JuiKeypadAction>
);

MuteAction.displayName = 'MuteAction';

const KeypadAction = () => (
  <JuiKeypadAction key="keypadAction">
    <JuiIconButton
      color="grey.900"
      disableToolTip
      size="xxlarge"
      symbol={dialer}
    />
    <span>Keypad</span>
  </JuiKeypadAction>
);

KeypadAction.displayName = 'KeypadAction';

const HoldAction = () => (
  <JuiKeypadAction key="holdAction">
    <JuiIconButton
      color="grey.900"
      disableToolTip
      size="xxlarge"
      symbol={hold}
    />
    <span>Hold</span>
  </JuiKeypadAction>
);

HoldAction.displayName = 'HoldAction';

const AddAction = () => (
  <JuiKeypadAction key="addAction">
    <JuiIconButton
      color="grey.900"
      disableToolTip
      size="xxlarge"
      symbol={callAdd}
    />
    <span>Add</span>
  </JuiKeypadAction>
);

AddAction.displayName = 'AddAction';

const RecordAction = () => (
  <JuiKeypadAction key="recordAction">
    <JuiIconButton
      color="grey.900"
      disableToolTip
      size="xxlarge"
      symbol={record}
    />
    <span>Record</span>
  </JuiKeypadAction>
);

RecordAction.displayName = 'RecordAction';

const CallActionsAction = () => (
  <JuiKeypadAction key="callActions">
    <JuiIconButton
      color="grey.900"
      disableToolTip
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

const EndCall = () => (
  <JuiFabButton
    color="semantic.negative"
    size="smallMedium"
    showShadow={false}
    tooltipPlacement="bottom"
    iconName="hand_up"
  />
);

const Dialer = (props: { isTransfer: boolean }) => {
  const { isTransfer } = props;
  const [active, setActive] = React.useState(true);
  const CallAction = isTransfer ? Transfer : End;
  return (
    <JuiDialer>
      <JuiHeaderContainer>
        <JuiTitleBar label="02:32" Actions={Actions} Status={Status} />
        {isTransfer ? (
          <JuiSwitchCallHeader>
            <JuiSwitchCallChip
              active={active}
              name={text('Name', 'Arunoda Susiripala')}
              time={text('Time', '00:00:00')}
              icon={active ? 'phone' : 'hold'}
              EndCall={EndCall}
              onClick={() => setActive(!active)}
            />
            <JuiSwitchCallChip
              active={!active}
              name={text('Name', 'Jessy Jiang')}
              time={text('Time', '00:00')}
              icon={!active ? 'phone' : 'hold'}
              onClick={() => setActive(!active)}
            />
          </JuiSwitchCallHeader>
        ) : (
          <JuiHeader
            Avatar={Avatar}
            name="Terry Webster"
            phone="(650) 555-12345"
            Back={Back}
          />
        )}
      </JuiHeaderContainer>
      <JuiContainer CallAction={CallAction} KeypadActions={KeypadActions} />
    </JuiDialer>
  );
};

storiesOf('Pattern', module).add('Dialer', () => {
  const isTransfer = boolean('isTransfer', false);
  return <Dialer isTransfer={isTransfer} />;
});
