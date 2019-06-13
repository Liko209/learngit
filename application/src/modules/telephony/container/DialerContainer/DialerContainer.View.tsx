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
import { sleep } from '../../helpers';
import {
  CallControlPanel,
  DialerPanel,
  ContactSearchPanel,
  KeypadPanel,
} from './panels';
import { RuiTooltipProps } from 'rcui/components/Tooltip';

type Props = DialerContainerViewProps & WithTranslation;

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
    shouldShowToolTip: false,
  };

  _onChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = event.target;
    this.props.setCallerPhoneNumber(value);
  }

  async componentDidMount() {
    if (this._shouldShowToolTip) {
      const { timer, promise } = sleep(1000);
      this._waitForAnimationEndTimer = timer;
      await promise;
      this.setState({
        shouldShowToolTip: this._shouldShowToolTip,
      });
      // this._toggleToolTip(true);
      const toggler = sleep(5000);
      this._timer = toggler.timer;
      await toggler.promise;
      // this._toggleToolTip(false);
      this.setState({
        shouldShowToolTip: false,
      });

      delete this._waitForAnimationEndTimer;
      delete this._timer;
    }

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
    } = this.props;

    const callerIdProps = {
      value: chosenCallerPhoneNumber,
      menu: callerPhoneNumberList,
      label: t('telephony.callFrom'),
      disabled: false,
      heightSize: 'default',
      onChange: this._onChange,
    };

    const tooltipProps: Partial<RuiTooltipProps> = {
      title: t('telephony.callerIdSelector.tooltip') as string,
      open: this.state.shouldShowToolTip,
      tooltipForceHide: this.state.shouldShowToolTip || shouldCloseToolTip,
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
