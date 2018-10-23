/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-10-18 15:36:39
 * Copyright © RingCentral. All rights reserved.
 */
import React, { ComponentType } from 'react';
import styled from '../../foundation/styled-components';
// import { JuiAvatar } from 'jui/component/Avatar';
import { height, width } from '../../foundation/utils';

type Props = {
  Avatar: ComponentType<any>;
  Presence: ComponentType<any>;
};

const StyledWrapper = styled.div`
  height: ${height(10)};
  width: ${width(10)};
  position: relative;
`;

const StyledPresenceWrapper = styled.div`
  height: ${height(3.5)};
  width: ${width(3.5)};
  position: absolute;
  bottom: 0;
  right: 0;
`;

class JuiAvatarWithPresence extends React.Component<Props> {
  render() {
    const { Avatar, Presence } = this.props;
    return (
      <StyledWrapper>
        <Avatar />
        <StyledPresenceWrapper>
          <Presence />
        </StyledPresenceWrapper>
      </StyledWrapper>
    );
  }
}

export { JuiAvatarWithPresence };
