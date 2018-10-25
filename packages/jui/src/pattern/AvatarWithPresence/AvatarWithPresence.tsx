/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-10-18 15:36:39
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import styled from '../../foundation/styled-components';
// import { JuiAvatar } from 'jui/component/Avatar';
import { height, width } from '../../foundation/utils';

type Props = {
  avatar: JSX.Element;
  presence: JSX.Element;
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
    const { avatar, presence } = this.props;
    return (
      <StyledWrapper>
        {avatar}
        <StyledPresenceWrapper>{presence}</StyledPresenceWrapper>
      </StyledWrapper>
    );
  }
}

export { JuiAvatarWithPresence };
