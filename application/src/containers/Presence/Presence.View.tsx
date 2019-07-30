/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-10-16 14:38:14
 * Copyright © RingCentral. All rights reserved.
 */
import * as React from 'react';
import { JuiPresence } from 'jui/components/Presence';
import { observer } from 'mobx-react';
import { PresenceViewProps, PresenceProps } from './types';

@observer
class PresenceView extends React.Component<PresenceViewProps & PresenceProps> {
  render() {
    const { presence, size, borderSize, uid, ...rest } = this.props;
    return (
      <JuiPresence
        presence={presence}
        size={size}
        borderSize={borderSize}
        {...rest}
      />
    );
  }
}

export { PresenceView };
