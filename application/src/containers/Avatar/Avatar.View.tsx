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
import { computed } from 'mobx';

@observer
class AvatarView extends React.Component<AvatarViewProps> {
  static defaultProps = {
    shouldShowShortName: false,
  };
  @computed
  private get _placeHolder() {
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
    return (
      <JuiAvatar
        color={bgColor}
        data-test-automation-id={automationId}
        presence={presence}
        {...rest}
      >
        <span className="avatar-short-name">{shortName}</span>
      </JuiAvatar>);
  }

  @computed
  private get _children() {
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
    return (
      <JuiAvatar
        src={accelerateURL(headShotUrl)}
        data-test-automation-id={automationId}
        color=""
        presence={presence}
        {...rest}
      />
    );
  }

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
        placeholder={this._placeHolder}
        animationForLoad
      >
        {this._children}
      </PreloadImg>
    ) : (
        this._placeHolder
      );
  }
}

export { AvatarView };
