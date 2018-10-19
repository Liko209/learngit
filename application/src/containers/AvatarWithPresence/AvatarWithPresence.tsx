/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-10-18 15:07:44
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { JuiAvatarWithPresence } from 'jui/pattern/AvatarWithPresence';
import { Avatar } from '@/containers/Avatar';
import { Presence } from '@/containers/Presence';
import { AvatarWithPresenceViewProps } from './types';

class AvatarWithPresence extends React.Component<
  AvatarWithPresenceViewProps,
  {}
> {
  constructor(props: AvatarWithPresenceViewProps) {
    super(props);
  }
  private get _presence() {
    return <Presence id={this.props.id} />;
  }
  private get _avatar() {
    return <Avatar uid={this.props.id} size="large" />;
  }
  render() {
    const { id, ...rest } = this.props;
    return (
      <JuiAvatarWithPresence
        presence={this._presence}
        avatar={this._avatar}
        {...rest}
      />
    );
  }
}

export { AvatarWithPresence };
