/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2019-02-27 10:46:49
 * Copyright © RingCentral. All rights reserved.
 */
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { PinViewProps } from './types';
import { JuiIconButton } from 'jui/components/Buttons';
import { catchError } from '@/common/catchError';

type Props = PinViewProps & WithTranslation;

@observer
class PinViewComponent extends Component<Props> {
  private _handleTogglePin = async () => {
    const { isPin, pin } = this.props;
    await pin(!isPin);
  }

  @catchError.flash({
    network: 'message.prompt.notAbleToUnpinForNetworkIssue',
    server: 'message.prompt.notAbleToUnpinForServerIssue',
  })
  private _handleUnpin = () => {
    return this._handleTogglePin();
  }

  @catchError.flash({
    network: 'message.prompt.notAbleToPinForNetworkIssue',
    server: 'message.prompt.notAbleToPinForServerIssue',
  })
  private _handlePin = () => {
    return this._handleTogglePin();
  }

  render() {
    const { isPin, shouldShowPinOption, shouldDisablePinOption, t } = this.props;
    return (
      shouldShowPinOption && (
        <JuiIconButton
          size="small"
          tooltipTitle={
            isPin
              ? t('message.action.unpin')
              : t('message.action.pin')
          }
          ariaLabel={
            isPin
              ? t('message.action.unpin')
              : t('message.action.pin')
          }
          color={isPin ? 'primary' : undefined}
          onClick={isPin ? this._handleUnpin : this._handlePin}
          disabled={shouldDisablePinOption}
          disableToolTip={shouldDisablePinOption}
          variant="plain"
          data-name="actionBarPin"
        >
          {isPin ? 'pin' : 'unpin'}
        </JuiIconButton>
      )
    );
  }
}

const PinView = withTranslation('translations')(PinViewComponent);

export { PinView };
