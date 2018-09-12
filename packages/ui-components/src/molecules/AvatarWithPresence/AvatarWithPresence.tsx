/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-08-17 15:38:14
 * Copyright © RingCentral. All rights reserved.
 */
import React, { RefObject } from 'react';
import styled from '../../styled-components';

import JuiAvatar from '../../atoms/Avatar';
import { AvatarPresence, PresenceProps } from '../../atoms/Presence';

type TJuiAvatarWithPresenceProps = {
  src?: string;
  innerRef?: RefObject<HTMLElement>;
  onClick: () => void;
} & PresenceProps;

const StyledAvatarWithPresence = styled.div`
  display: inline-block;
  position: relative;
  height: ${({ theme }) => theme.size.height * 10};
  width: ${({ theme }) => theme.size.width * 10};
`;

const JuiAvatarWithPresence: React.SFC<TJuiAvatarWithPresenceProps> = (
  props: TJuiAvatarWithPresenceProps,
) => {
  return (
    <StyledAvatarWithPresence
      className={props.className}
      innerRef={props.innerRef}
      onClick={props.onClick}
    >
      <AvatarPresence presence={props.presence} />
      <JuiAvatar alt="avatar" size="large" src={props.src} />
    </StyledAvatarWithPresence>
  );
};

export { TJuiAvatarWithPresenceProps };

export default JuiAvatarWithPresence;
