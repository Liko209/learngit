/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-08-17 15:38:14
 * Copyright © RingCentral. All rights reserved.
 */
import React, { RefObject } from 'react';
import styled from '../../styled-components';

import Avatar from '../../atoms/Avatar';
import { AvatarPresence, PresenceProps } from '../../atoms/Presence';

type TAvatarWithPresenceProps = {
  src?: string;
  innerRef?: RefObject<HTMLElement>;
  onClick: ((event: React.MouseEvent<HTMLInputElement>) => void);
} & PresenceProps;

const StyledAvatarWithPresence = styled.div`
  display: inline-block;
  position: relative;
  height: ${({ theme }) => theme.spacing.unit * 10};
  width: ${({ theme }) => theme.spacing.unit * 10};
`;

const AvatarWithPresence: React.SFC<TAvatarWithPresenceProps> =
  (props: TAvatarWithPresenceProps) => {
    return (
      <StyledAvatarWithPresence className={props.className} innerRef={props.innerRef} onClick={props.onClick}>
        <AvatarPresence presence={props.presence} />
        <Avatar alt="avatar" size="large" src={props.src} />
      </StyledAvatarWithPresence>
    );
  };

export default AvatarWithPresence;
