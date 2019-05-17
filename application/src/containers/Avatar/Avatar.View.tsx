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
import defaultAvatar from './defaultAvatar.svg';
import defaultCoverAvatar from './defaultCoverAvatar.svg';
import { accelerateURL } from '@/common/accelerateURL';

@observer
class AvatarView extends React.Component<AvatarViewProps> {
  static defaultProps = {
    shouldShowShortName: false,
  };

  render() {
    const {
      bgColor,
      headShotUrl,
      shouldShowShortName,
      shortName,
      automationId,
      presence,
      showDefaultAvatar,
      ...rest
    } = this.props;

    const AvatarWithName = (
      <JuiAvatar
        color={bgColor}
        data-test-automation-id={automationId}
        presence={presence}
        {...rest}
      >
        <span className="avatar-short-name">{shortName}</span>
      </JuiAvatar>
    );

    const DefaultAvatar = (
      <JuiAvatar
        src={rest.cover ? defaultCoverAvatar : defaultAvatar}
        data-test-automation-id={automationId}
        color=""
        {...rest}
      />
    );

    if (showDefaultAvatar) {
      return DefaultAvatar;
    }

    return !shouldShowShortName ? (
      <PreloadImg
        url={accelerateURL(headShotUrl)}
        placeholder={AvatarWithName}
        animationForLoad={true}
      >
        <JuiAvatar
          src={accelerateURL(headShotUrl)}
          data-test-automation-id={automationId}
          color=""
          presence={presence}
          {...rest}
        />
      </PreloadImg>
    ) : (
      AvatarWithName
    );
  }
}

export { AvatarView };
