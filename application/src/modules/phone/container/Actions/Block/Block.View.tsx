/*
 * @Author: joy.zhang (joy.zhang@ringcentral.com)
 * @Date: 2019-06-24 13:13:44
 * Copyright © RingCentral. All rights reserved.
 */

import { withTranslation, WithTranslation } from 'react-i18next';
import { ActionButton } from 'jui/pattern/Phone/VoicemailItem';
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { catchError } from '@/common/catchError';
import { BlockViewProps, BUTTON_TYPE } from './types';

type Props = BlockViewProps & WithTranslation;

@observer
class BlockViewComponent extends Component<Props> {
  @catchError.flash({
    network: 'phone.prompt.notAbleToUnblockForNetworkIssue',
    server: 'phone.prompt.notAbleToUnblockForServerIssue',
  })
  private _handleUnblock = () => {
    return this.props.block();
  }

  @catchError.flash({
    network: 'phone.prompt.notAbleToBlockForNetworkIssue',
    server: 'phone.prompt.notAbleToBlockForServerIssue',
  })
  private _handleBlock = () => {
    return this.props.block();
  }

  _handleClick = () => {
    const { isBlocked, hookAfterClick } = this.props;
    if (isBlocked) {
      this._handleUnblock();
    } else {
      this._handleBlock();
    }
    hookAfterClick && hookAfterClick();
  }

  get _tooltip() {
    const { isBlocked, t } = this.props;
    return isBlocked ? t('phone.unblockNumber') : t('phone.blockNumber');
  }

  get _screenReader() {
    const { isBlocked, t } = this.props;
    return isBlocked ? t('phone.unblockNumber') : t('phone.blockNumber');
  }

  get _icon() {
    const { type, isBlocked } = this.props;
    if (type === BUTTON_TYPE.ICON) {
      return isBlocked ? 'unblocked' : 'blocked';
    }

    return isBlocked ? 'blocked' : 'unblocked';
  }

  render() {
    const { type, entity } = this.props;
    return (
      <ActionButton
        key={`${entity}-block`}
        icon={this._icon}
        type={type}
        tooltip={this._tooltip}
        onClick={this._handleClick}
        screenReader={this._screenReader}
        automationId={`${entity}-block-button`}
      />
    );
  }
}

const BlockView = withTranslation('translations')(BlockViewComponent);

export { BlockView };
