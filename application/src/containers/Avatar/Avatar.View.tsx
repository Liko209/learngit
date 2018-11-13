/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-9-18 9:20:21
 * Copyright © RingCentral. All rights reserved.
 */
import * as React from 'react';
import { observer } from 'mobx-react';
import { JuiAvatar } from 'jui/components/Avatar';
import { AvatarViewProps } from './types';

@observer
class AvatarView extends React.Component<AvatarViewProps> {
  render() {
    const {
      bgColor,
      headShotUrl,
      shouldShowShortName,
      shortName,
      autoMationId,
      presence,
      ...rest
    } = this.props;
    return !shouldShowShortName ? (
      <JuiAvatar
        src={headShotUrl}
        data-test-automation-id={autoMationId}
        color=""
        presence={presence}
        {...rest}
      />
    ) : (
      <JuiAvatar
        color={bgColor}
        data-test-automation-id={autoMationId}
        presence={presence}
        {...rest}
      >
        {shortName}
      </JuiAvatar>
    );
  }
}

export { AvatarView };
