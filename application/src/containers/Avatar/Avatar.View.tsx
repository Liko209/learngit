/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-9-18 9:20:21
 * Copyright © RingCentral. All rights reserved.
 */
import * as React from 'react';
import { observer } from 'mobx-react';
import { JuiAvatar } from 'jui/components/Avatar';
import { AvatarViewProps } from './types';
import { PreloadImg } from '../common/PreloadImg';

@observer
class AvatarView extends React.Component<AvatarViewProps> {
  render() {
    const {
      bgColor,
      headShotUrl,
      shouldShowShortName,
      shortName,
      automationId,
      presence,
      ...rest
    } = this.props;
    const placeholder = (
      <JuiAvatar
        color={bgColor}
        data-test-automation-id={automationId}
        presence={presence}
        {...rest}
      >
        {shortName}
      </JuiAvatar>
    );
    const content = (
      <JuiAvatar
        src={headShotUrl}
        data-test-automation-id={automationId}
        color=""
        presence={presence}
        {...rest}
      />
    );
    return !shouldShowShortName ? (
      <PreloadImg url={headShotUrl} placeholder={placeholder}>
        {content}
      </PreloadImg>
    ) : (
      placeholder
    );
  }
}

export { AvatarView };
