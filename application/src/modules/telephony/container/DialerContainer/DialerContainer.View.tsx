/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2019-03-06 14:31:51
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import { observer } from 'mobx-react';
import { DialPad } from 'jui/pattern/Dialer';
import _ from 'lodash';
import { DialerContainerViewProps, DialerContainerViewState } from './types';
import { withTranslation, WithTranslation } from 'react-i18next';
import { PhoneNumberType } from 'sdk/module/phoneNumber/entity';
import {
  CallControlPanel,
  DialerPanel,
  ContactSearchPanel,
  KeypadPanel,
} from './panels';

type Props = DialerContainerViewProps & WithTranslation;

const CLOSE_TOOLTIP_TIME = 5000;

@observer
class DialerContainerViewComponent extends React.Component<
  Props,
  DialerContainerViewState
> {
  private _timer: NodeJS.Timeout;
  private _waitForAnimationEndTimer: NodeJS.Timeout;
  private _shouldShowToolTip =
    !this.props.hasDialerOpened && !this.props.shouldCloseToolTip;

  state = {
    shouldShowToolTip: true,
  };

  _onChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = event.target;
    this.props.setCallerPhoneNumber(value);
  }

  componentDidMount() {
    this.props.onAfterDialerOpen();
  }

  componentWillUnmount() {
    if (this._timer) {
      clearTimeout(this._timer);
    }
    if (this._waitForAnimationEndTimer) {
      clearTimeout(this._waitForAnimationEndTimer);
    }
  }

  componentDidUpdate() {
    const { enteredDialer } = this.props;
    const { shouldShowToolTip } = this.state;
    if (enteredDialer && shouldShowToolTip) {
      this._timer = setTimeout(this._handleCloseToolTip, CLOSE_TOOLTIP_TIME);
    }
  }

  private _handleCloseToolTip = () => {
    const { enteredDialer } = this.props;
    enteredDialer &&
      this.setState({
        shouldShowToolTip: false,
      });
  }

  render() {
    const {
      keypadEntered,
      isDialer,
      isForward,
      clickToInput,
      playAudio,
      dialerInputFocused,
      callerPhoneNumberList,
      chosenCallerPhoneNumber,
      t,
      shouldEnterContactSearch,
      dtmfThroughKeypad,
      dtmfThroughKeyboard,
      dialerFocused,
      shouldCloseToolTip,
      enteredDialer,
    } = this.props;

    const { shouldShowToolTip } = this.state;

    const callerIdProps = {
      value: chosenCallerPhoneNumber,
      menu: callerPhoneNumberList.map(callerPhoneNumber => {
        return Object.assign({}, callerPhoneNumber, {
          usageType:
            callerPhoneNumber.usageType === PhoneNumberType.NickName
              ? callerPhoneNumber.label
              : t(
                  `telephony.phoneNumberType.${callerPhoneNumber.usageType[0].toLowerCase() +
                    callerPhoneNumber.usageType.slice(
                      1,
                      callerPhoneNumber.usageType.length,
                    )}`,
                ),
          isTwoLine: callerPhoneNumber.usageType !== PhoneNumberType.Blocked,
        });
      }),
      label: t('telephony.callFrom'),
      disabled: false,
      heightSize: 'default',
      onChange: this._onChange,
    };

    const tooltipProps = {
      title: t('telephony.callerIdSelector.tooltip') as string,
      open:
        this._shouldShowToolTip &&
        enteredDialer &&
        shouldShowToolTip &&
        !shouldCloseToolTip,
      tooltipForceHide: this._shouldShowToolTip || shouldCloseToolTip,
    };

    if (isDialer) {
      return (
        <DialerPanel
          callerIdProps={callerIdProps}
          tooltipProps={tooltipProps}
          dialerFocused={dialerFocused}
          playAudio={playAudio}
          clickToInput={clickToInput}
          dialerInputFocused={dialerInputFocused}
          isForward={isForward}
        />
      );
    }
    if (shouldEnterContactSearch) {
      return (
        <ContactSearchPanel
          callerIdProps={callerIdProps}
          tooltipProps={tooltipProps}
        />
      );
    }
    if (keypadEntered) {
      return (
        <KeypadPanel
          dtmfThroughKeypad={dtmfThroughKeypad}
          dtmfThroughKeyboard={dtmfThroughKeyboard}
          dialerFocused={dialerFocused}
        />
      );
    }

    return <CallControlPanel />;
  }
}

const DialerContainerView = withTranslation('translations')(
  DialerContainerViewComponent,
);

export { DialerContainerView, DialPad };
