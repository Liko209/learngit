/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2019-06-25 14:49:45
 * Copyright © RingCentral. All rights reserved.
 */
import React, { useState } from 'react';
import { storiesOf } from '@storybook/react';
import { boolean } from '@storybook/addon-knobs';
import { JuiAvatar } from '../../../components/Avatar';
import { JuiContactInfo } from '../../Phone/ContactInfo';
import { JuiListItemAvatar, JuiListItemText } from '../../../components/Lists';
import { JuiIconography } from '../../../foundation/Iconography';
import avatarImg from '../../../components/Avatar/__stories__/img/avatar.jpg';

import {
  JuiRecentCalls,
  JuiDialer,
  JuiRecentCallItem,
  StyledContactWrapper,
  StyledCallLogStatusWrapper,
  StyledTime,
  StyledSelectedItemIcon,
} from '..';

const ContactInfo = () => (
  <JuiContactInfo isUnread={false}>
    <JuiListItemAvatar>
      <JuiAvatar src={avatarImg} />
    </JuiListItemAvatar>
    <JuiListItemText primary="Shining Miao" secondary="(888) 888 - 8888" />
  </JuiContactInfo>
);

const ContactInfo1 = () => (
  <JuiContactInfo isUnread={false}>
    <JuiListItemAvatar>
      <JuiAvatar src={avatarImg} />
    </JuiListItemAvatar>
    <JuiListItemText
      primary="Shining Miao6666666"
      secondary="(888) 888 - 8888"
    />
  </JuiContactInfo>
);
const RecentCall = (props: { isTransfer: boolean }) => {
  const [selected, setSelected] = useState(0);
  const { isTransfer } = props;
  return (
    <JuiDialer>
      <JuiRecentCalls addMargin>
        <JuiRecentCallItem
          selected={selected === 0}
          onClick={() => setSelected(0)}
        >
          <StyledContactWrapper>
            <ContactInfo />
          </StyledContactWrapper>
          {isTransfer && selected === 0 ? (
            <StyledSelectedItemIcon>
              <JuiIconography iconSize="medium">
                item-list-selected
              </JuiIconography>
            </StyledSelectedItemIcon>
          ) : (
            <>
              <StyledCallLogStatusWrapper>
                <JuiIconography iconSize="medium" iconColor={['grey', '600']}>
                  incall
                </JuiIconography>
              </StyledCallLogStatusWrapper>
              <StyledTime>3/7/2019</StyledTime>
            </>
          )}
        </JuiRecentCallItem>
        <JuiRecentCallItem
          selected={selected === 1}
          onClick={() => setSelected(1)}
        >
          <StyledContactWrapper>
            <ContactInfo1 />
          </StyledContactWrapper>
          {isTransfer && selected === 1 ? (
            <StyledSelectedItemIcon>
              <JuiIconography iconSize="medium">
                item-list-selected
              </JuiIconography>
            </StyledSelectedItemIcon>
          ) : (
            <>
              <StyledCallLogStatusWrapper>
                <JuiIconography iconSize="medium" iconColor={['grey', '600']}>
                  outcall
                </JuiIconography>
              </StyledCallLogStatusWrapper>
              <StyledTime>8:56AM</StyledTime>
            </>
          )}
        </JuiRecentCallItem>
        <JuiRecentCallItem
          selected={selected === 2}
          onClick={() => setSelected(2)}
        >
          <StyledContactWrapper>
            <ContactInfo />
          </StyledContactWrapper>
          {isTransfer && selected === 2 ? (
            <StyledSelectedItemIcon>
              <JuiIconography iconSize="medium">
                item-list-selected
              </JuiIconography>
            </StyledSelectedItemIcon>
          ) : (
            <>
              <StyledCallLogStatusWrapper>
                <JuiIconography
                  iconSize="medium"
                  iconColor={['accent', 'tomato']}
                >
                  missedcall
                </JuiIconography>
              </StyledCallLogStatusWrapper>
              <StyledTime>12/12/2019</StyledTime>
            </>
          )}
        </JuiRecentCallItem>
      </JuiRecentCalls>
    </JuiDialer>
  );
};

storiesOf('Pattern', module).add('Recent Calls', () => {
  const isTransfer = boolean('isTransfer', false);
  return <RecentCall isTransfer={isTransfer} />;
});
