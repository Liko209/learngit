/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-9-18 9:20:21
 * Copyright © RingCentral. All rights reserved.
 */
import * as React from 'react';
import { JuiAvatar } from 'jui/components/Avatar';
import { observer } from 'mobx-react';
import { AvatarViewProps } from './types';

@observer
class AvatarView extends React.Component<AvatarViewProps> {
  constructor(props: AvatarViewProps) {
    super(props);
  }
  render() {
    const { innerRef, bgColor, name, url, ...rest } = this.props;
    return url ? (
      <JuiAvatar src={url} {...rest} bgcolor={bgColor} />
    ) : (
      <JuiAvatar bgcolor={bgColor} {...rest}>
        {name}
      </JuiAvatar>
    );
  }
}

export { AvatarView };
