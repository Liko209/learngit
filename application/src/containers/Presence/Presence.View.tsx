/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-10-16 14:38:14
 * Copyright © RingCentral. All rights reserved.
 */
import * as React from 'react';
import { JuiPresence } from 'jui/components/Presence';
import { observer } from 'mobx-react';
import { PresenceViewProps } from './types';

@observer
class PresenceView extends React.Component<PresenceViewProps> {
  render() {
    const { presence, size, ...rest } = this.props;

    return <JuiPresence presence={presence} size={size} {...rest} />;
  }
}

export { PresenceView };
