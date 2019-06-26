/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2019-03-06 14:31:51
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import { observer } from 'mobx-react';
import { DialPad } from 'jui/pattern/Dialer';
import { DialerContainerViewProps, DialerContainerViewState } from './types';
import {
  CallControlPanel,
  DialerPanel,
  ContactSearchPanel,
  KeypadPanel,
} from './panels';

const CLOSE_TOOLTIP_TIME = 5000;

@observer
class DialerContainerView extends React.Component<
  DialerContainerViewProps,
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
      shouldEnterContactSearch,
      dtmfThroughKeypad,
      dtmfThroughKeyboard,
      dialerFocused,
      shouldCloseToolTip,
      enteredDialer,
    } = this.props;

    const { shouldShowToolTip } = this.state;

    const callerIdProps = {
      callerIdProps: {
        value: chosenCallerPhoneNumber,
        menu: callerPhoneNumberList,
        disabled: false,
        onChange: this._onChange,
      },
      tooltipProps: {
        open:
          this._shouldShowToolTip &&
          enteredDialer &&
          shouldShowToolTip &&
          !shouldCloseToolTip,
        tooltipForceHide: this._shouldShowToolTip || shouldCloseToolTip,
      },
    };

    if (isDialer || isForward) {
      return (
        <DialerPanel
          callerIdProps={callerIdProps}
          dialerFocused={dialerFocused}
          playAudio={playAudio}
          clickToInput={clickToInput}
          dialerInputFocused={dialerInputFocused}
          isForward={isForward}
        />
      );
    }
    if (shouldEnterContactSearch) {
      return <ContactSearchPanel callerIdProps={callerIdProps} />;
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

export { DialerContainerView, DialPad };
