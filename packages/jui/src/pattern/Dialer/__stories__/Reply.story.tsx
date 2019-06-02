/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2019-04-29 15:55:34
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { storiesOf } from '@storybook/react';
import { withInfoDecorator } from '../../../foundation/utils/decorators';
import { JuiAvatar } from '../../../components/Avatar';
import { JuiIconButton } from '../../../components/Buttons';
import { JuiDraggableDialog } from '../../../components/Dialog';
import avatarImg from '../../../components/Avatar/__stories__/img/avatar.jpg';
import { boolean } from '@storybook/addon-knobs';
import minimize from '../../../assets/jupiter-icon/icon-minimize.svg';
import previous from '../../../assets/jupiter-icon/icon-previous.svg';
import tearOff from '../../../assets/jupiter-icon/icon-tear-off.svg';

import {
  JuiReply,
  JuiTitleBar,
  JuiHeader,
  JuiHeaderContainer,
  JuiDialer,
  JuiPreDefineMessage,
  JuiPreDefineMenuItem,
  JuiCustomReply,
} from '..';

const knobs = {
  open: () => boolean('open', false),
  img: () => boolean('open', false),
};

const Avatar = () => <JuiAvatar size="large" src={avatarImg} />;

const MinimizeAction = () => (
  <JuiIconButton
    size="small"
    tooltipTitle="Minimize"
    variant="plain"
    color="common.white"
    symbol={minimize}
  />
);

const DetachOrAttachAction = () => (
  <JuiIconButton
    size="small"
    tooltipTitle="Detach"
    variant="plain"
    color="common.white"
    symbol={tearOff}
  />
);

const Actions = [DetachOrAttachAction, MinimizeAction];

const Back = () => (
  <JuiIconButton
    size="large"
    tooltipTitle="Back"
    variant="plain"
    color="common.white"
    symbol={previous}
  />
);

const handleClick = () => {};

const InMeeting = () => (
  <JuiPreDefineMessage text="In a Meeting" handleClick={handleClick} />
);
const OnMyWay = () => (
  <JuiPreDefineMessage text="On my way" handleClick={handleClick} />
);

const CallBack = () => (
  <JuiPreDefineMessage
    text="Call me back in..."
    automationId="reply-with-will-call-back"
  >
    {[{ label: '5 min' }].map(({ label }) => (
      <JuiPreDefineMenuItem automationId="reply-with-0-type-time">
        {label}
      </JuiPreDefineMenuItem>
    ))}
  </JuiPreDefineMessage>
);

const WillCallBack = () => (
  <JuiPreDefineMessage text="Will call you back in....">
    {[{ label: '5 min' }].map(({ label }) => (
      <JuiPreDefineMenuItem>{label}</JuiPreDefineMenuItem>
    ))}
  </JuiPreDefineMessage>
);

let shiftDown = false;
let message = '';

const filterCharacters = '~@#$%^&*()_+{}[]|<>/';

const handleMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  message = e.target.value.trimLeft();
};

const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
  if (filterCharacters.indexOf(e.key) > 0) {
    e.preventDefault();
  } else if (e.key === 'Shift') {
    shiftDown = true;
  } else if (!shiftDown && e.key === 'Enter') {
    if (message.length === 0) {
      // tslint:disable-next-line:no-console
      console.log("Can't send empty message");
    }
  }
};

const handleKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
  if (e.key === 'Shift') {
    shiftDown = false;
  }
};

const handleMouseDown = (e: React.MouseEvent) => {
  e.stopPropagation();
};

const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
  if (event.clipboardData) {
    let msg = event.clipboardData.getData('text/plain');
    msg = msg.replace(/[\~\@\#\$\%\^\&\*\(\)\_\+\{\}\[\]\|\<\>\/]*/g, '');
    event.clipboardData.setData('text/plain', msg);
  }
};

const CustomReplyTextarea = () => (
  <JuiCustomReply
    id="incoming-call-custom-reply-id"
    fullWidth={true}
    placeholder="Type a custom message"
    label="Custom message"
    inputProps={{
      maxLength: 100,
    }}
    onChange={handleMessageChange}
    onKeyDown={handleKeyDown}
    onKeyUp={handleKeyUp}
    draggable={false}
    onMouseDown={handleMouseDown}
    onPaste={handlePaste}
  />
);

const PreDefines = [InMeeting, OnMyWay, CallBack, WillCallBack];

storiesOf('Pattern', module).add('Reply Call', () => {
  return (
    <JuiDialer>
      <JuiHeaderContainer>
        <JuiTitleBar Actions={Actions} />
        <JuiHeader
          Avatar={Avatar}
          name="Terry Webster"
          phone="(650) 555-12345"
          Back={Back}
        />
      </JuiHeaderContainer>
      <JuiReply
        count={{ time: 55, unit: 's' }}
        countText="Reply in "
        PreDefines={PreDefines}
        CustomReply={CustomReplyTextarea}
      />
    </JuiDialer>
  );
});
