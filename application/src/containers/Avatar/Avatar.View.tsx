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
<<<<<<< HEAD
import defaultAvatar from './defaultAvatar.svg';
import defaultCoverAvatar from './defaultCoverAvatar.svg';
=======
>>>>>>> hotfix/1.2.2

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
        <span>{shortName}</span>
      </JuiAvatar>
    );

<<<<<<< HEAD
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

=======
>>>>>>> hotfix/1.2.2
    return !shouldShowShortName ? (
      <PreloadImg
        url={headShotUrl}
        placeholder={AvatarWithName}
        animationForLoad={true}
      >
        <JuiAvatar
          src={headShotUrl}
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
