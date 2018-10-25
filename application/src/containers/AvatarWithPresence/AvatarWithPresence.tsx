/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-10-18 15:07:44
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { observer } from 'mobx-react';
import { JuiAvatarWithPresence } from 'jui/pattern/AvatarWithPresence';
import { Avatar } from '@/containers/Avatar';
import { Presence } from '@/containers/Presence';
import { AvatarWithPresenceViewProps } from './types';

@observer
class AvatarWithPresence extends React.Component<
  AvatarWithPresenceViewProps,
  {}
> {
  constructor(props: AvatarWithPresenceViewProps) {
    super(props);
  }
  private get _presence() {
    const { uid, ...rest } = this.props;
    return <Presence uid={uid} size="large" {...rest} />;
  }
  private get _avatar() {
    const { uid, ...rest } = this.props;
    return <Avatar uid={uid} size="large" {...rest} />;
  }
  render() {
    return (
      <JuiAvatarWithPresence presence={this._presence} avatar={this._avatar} />
    );
  }
}

export { AvatarWithPresence };
