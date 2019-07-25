/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2019-07-24 10:28:51
 * Copyright © RingCentral. All rights reserved.
 */
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import styled from '../../../foundation/styled-components';

import { text, number, boolean } from '@storybook/addon-knobs';
import {
  JuiRightShellMemberListHeader,
  JuiRightShellMemberListTitle,
  JuiRightShellMemberListBody,
  JuiRightShellMemberListAvatarWrapper,
  JuiRightShellMemberListSubTitle,
  JuiRightShellMemberListMoreCount,
} from '../MemberList/MemberList';
// import { JuiRightShelfEmptyScreen } from '../../EmptyScreen';
// import { JuiButton } from '../../../components/Buttons';
// import image from './Files.svg';
import { JuiLink } from '../../../components/Link';
import { JuiIconButton } from '../../../components/Buttons';
import { JuiAvatar } from '../../../components/Avatar';
import { JuiPresence, PRESENCE } from '../../../components/Presence/Presence';
import { Loading } from '../../../hoc/withLoading';

storiesOf('Pattern/ConversationRightShelf', module).add('MemberList', () => {
  const title = text('title', 'Members');
  const responsiveWidth = number('responsive width', 268, {
    range: true,
    min: 200,
    max: 360,
    step: 1,
  });
  const memberCount = number('member count', 10);
  const guestCount = number('guest count', 4);
  const moreCount = number('more count', 15);
  const loading = boolean('loading', false);
  // const content = text(
  //   'content',
  //   'Files that get shared in your conversation automatically show up here.',
  // );
  const Wrapper = styled.div`
    width: ${responsiveWidth}px;
    background: white;
  `;
  return (
    <Wrapper>
      <JuiRightShellMemberListHeader>
        <div>
          <JuiRightShellMemberListTitle>{title}</JuiRightShellMemberListTitle>
          {loading ? null : (
            <JuiLink size="small">Show all {memberCount + guestCount}</JuiLink>
          )}
        </div>
        <JuiIconButton
          variant="plain"
          color="grey.500"
          size="small"
          tooltipTitle="add member"
        >
          addmember_border
        </JuiIconButton>
      </JuiRightShellMemberListHeader>
      <JuiRightShellMemberListBody loading={loading}>
        <JuiRightShellMemberListAvatarWrapper>
          {Array(memberCount)
            .fill(1)
            .map((i, index) => (
              <JuiAvatar
                size="medium"
                color="lake"
                tooltip="Some Person"
                key={index}
                presence={
                  <JuiPresence
                    presence={PRESENCE.AVAILABLE}
                    size="medium"
                    borderSize="medium"
                  />
                }
              >
                SH
              </JuiAvatar>
            ))}
          {moreCount ? (
            <JuiRightShellMemberListMoreCount count={moreCount} />
          ) : null}
        </JuiRightShellMemberListAvatarWrapper>
        {guestCount ? (
          <>
            <JuiRightShellMemberListSubTitle>
              Guests
            </JuiRightShellMemberListSubTitle>
            <JuiRightShellMemberListAvatarWrapper>
              {Array(guestCount)
                .fill(1)
                .map((i, index) => (
                  <JuiAvatar
                    size="medium"
                    color="lake"
                    tooltip="Some Person"
                    key={index}
                    presence={
                      <JuiPresence
                        presence={PRESENCE.AVAILABLE}
                        size="medium"
                        borderSize="medium"
                      />
                    }
                  >
                    SH
                  </JuiAvatar>
                ))}
              {moreCount ? (
                <JuiRightShellMemberListMoreCount count={moreCount} />
              ) : null}
            </JuiRightShellMemberListAvatarWrapper>
          </>
        ) : null}
      </JuiRightShellMemberListBody>
    </Wrapper>
  );
});
