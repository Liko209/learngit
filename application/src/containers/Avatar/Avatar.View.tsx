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
  render() {
    const { bgColor, headShotUrl, shouldShowShortName, shortName, ...rest } = this.props;
    return !shouldShowShortName ? (
      <JuiAvatar src={headShotUrl} {...rest} color="" />
    ) : (
      <JuiAvatar color={bgColor} {...rest}>
        {shortName}
      </JuiAvatar>
    );
  }
}

export { AvatarView };
