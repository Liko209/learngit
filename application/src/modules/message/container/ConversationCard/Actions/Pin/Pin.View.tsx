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
import { Notification } from '@/containers/Notification';
import {
  ToastType,
  ToastMessageAlign,
} from '@/containers/ToastWrapper/Toast/types';
type Props = PinViewProps & WithTranslation;

@observer
class PinViewComponent extends Component<Props> {
  private _handlePinButton = async () => {
    const { isPin, pin } = this.props;
    try {
      await pin(!isPin);
    } catch (error) {
      const message = !isPin
        ? 'message.prompt.SorryWeWereNotAbleToPinTheMessage'
        : 'message.prompt.SorryWeWereNotAbleToUnpinTheMessage';
      Notification.flashToast({
        message,
        type: ToastType.ERROR,
        messageAlign: ToastMessageAlign.LEFT,
        fullWidth: false,
        dismissible: false,
      });
    }
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
          onClick={this._handlePinButton}
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
