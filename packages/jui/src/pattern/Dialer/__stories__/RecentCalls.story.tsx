/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2019-06-25 14:49:45
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { storiesOf } from '@storybook/react';
import { JuiAvatar } from '../../../components/Avatar';
import { ContactItem } from '../../ContactInfo';
import { JuiListItemAvatar, JuiListItemText } from '../../../components/Lists';
import { JuiIconography } from '../../../foundation/Iconography';
import { JuiDraggableDialog } from '../../../components/Dialog';
import avatarImg from '../../../components/Avatar/__stories__/img/avatar.jpg';

import {
  JuiRecentCalls,
  JuiDialer,
  JuiRecentCallItem,
  StyledContactWrapper,
  StyledCallLogStatusWrapper,
  StyledTime,
} from '..';

const ContactInfo = () => (
  <ContactItem disableButton={true} isUnread={false}>
    <JuiListItemAvatar>
      <JuiAvatar src={avatarImg} />
    </JuiListItemAvatar>
    <JuiListItemText primary="Shining Miao" secondary="(888) 888 - 8888" />
  </ContactItem>
);

const ContactInfo1 = () => (
  <ContactItem disableButton={true} isUnread={false}>
    <JuiListItemAvatar>
      <JuiAvatar src={avatarImg} />
    </JuiListItemAvatar>
    <JuiListItemText
      primary="Shining Miao6666666"
      secondary="(888) 888 - 8888"
    />
  </ContactItem>
);

storiesOf('Pattern', module).add('Recent Calls', () => {
  return (
    <JuiDialer>
      <JuiRecentCalls>
        <JuiRecentCallItem>
          <StyledContactWrapper>
            <ContactInfo />
          </StyledContactWrapper>
          <StyledCallLogStatusWrapper>
            <JuiIconography iconSize="medium" iconColor={['grey', '600']}>
              incall
            </JuiIconography>
          </StyledCallLogStatusWrapper>
          <StyledTime>3/7/2019</StyledTime>
        </JuiRecentCallItem>
        <JuiRecentCallItem>
          <StyledContactWrapper>
            <ContactInfo1 />
          </StyledContactWrapper>
          <StyledCallLogStatusWrapper>
            <JuiIconography iconSize="medium" iconColor={['grey', '600']}>
              outcall
            </JuiIconography>
          </StyledCallLogStatusWrapper>
          <StyledTime>8:56AM</StyledTime>
        </JuiRecentCallItem>
        <JuiRecentCallItem>
          <StyledContactWrapper>
            <ContactInfo />
          </StyledContactWrapper>
          <StyledCallLogStatusWrapper>
            <JuiIconography iconSize="medium" iconColor={['accent', 'tomato']}>
              missedcall
            </JuiIconography>
          </StyledCallLogStatusWrapper>
          <StyledTime>12/12/2019</StyledTime>
        </JuiRecentCallItem>
      </JuiRecentCalls>
    </JuiDialer>
  );
});
