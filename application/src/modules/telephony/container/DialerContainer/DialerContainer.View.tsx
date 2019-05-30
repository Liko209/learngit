/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2019-03-06 14:31:51
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import { observer } from 'mobx-react';
import { JuiContainer, DialPad, CallerIdSelector } from 'jui/pattern/Dialer';
import { RuiTooltip } from 'rcui/components/Tooltip';
import _ from 'lodash';
import { DialerContainerViewProps, DialerContainerViewState } from './types';
import { Mute } from '../Mute';
import { Keypad } from '../Keypad';
import { Hold } from '../Hold';
import { Add } from '../Add';
import { Record } from '../Record';
import { CallActions } from '../CallActions';
import { End } from '../End';
import { DialBtn } from '../DialBtn';
import { withTranslation, WithTranslation } from 'react-i18next';
import { PhoneNumberType } from 'sdk/module/phoneNumber/types';

const KEYPAD_ACTIONS = [Mute, Keypad, Hold, Add, Record, CallActions];

type Props = DialerContainerViewProps & WithTranslation;

function sleep(timeout: number) {
  let timer: any;
  const promise = new Promise((resolve) => {
    timer = setTimeout(resolve, timeout);
  });
  return {
    timer,
    promise,
  };
}

@observer
class DialerContainerViewComponent extends React.Component<
  Props,
  DialerContainerViewState
> {
  private _timer: NodeJS.Timeout;
  private _waitForAnimationEndTimer: NodeJS.Timeout;

  constructor(props: Props) {
    super(props);
    // do not sync this state with `hasDialerOpened`, since once opened, `hasDialerOpened` would be set to `true` immediately
    this.state = {
      shouldShowToolTip: !props.hasDialerOpened,
    };
  }

  _onChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = event.target;
    this.props.setCallerPhoneNumber(value);
  }

  async componentDidMount() {
    if (this.state.shouldShowToolTip) {
      const { timer, promise } = sleep(1000);
      this._waitForAnimationEndTimer = timer;
      await promise;
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
      clickToInput,
      playAudio,
      dialerInputFocused,
      callerPhoneNumberList,
      chosenCallerPhoneNumber,
      t,
      dialerFocused,
      dtmfThroughKeyboard,
      dtmfThroughKeypad,
    } = this.props;
    let keypadActions;
    let callAction = End;

    const callerIdProps = {
      value: chosenCallerPhoneNumber,
      menu: callerPhoneNumberList.map((callerPhoneNumber) => {
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

    if (isDialer) {
      callAction = DialBtn;
      const callerIdSelector = <CallerIdSelector {...callerIdProps} />;
      keypadActions = (
        <>
          <RuiTooltip
            title={t('telephony.callerIdSelector.tooltip')}
            placement="bottom"
            open={this.state.shouldShowToolTip}
            tooltipForceHide={this.state.shouldShowToolTip}
          >
            {callerIdSelector}
          </RuiTooltip>
          <DialPad
            makeMouseEffect={clickToInput}
            makeKeyboardEffect={playAudio}
            shouldHandleKeyboardEvts={dialerInputFocused}
          />
        </>
      );
    } else if (keypadEntered) {
      keypadActions = (
        <DialPad
          makeMouseEffect={dtmfThroughKeypad}
          makeKeyboardEffect={dtmfThroughKeyboard}
          shouldHandleKeyboardEvts={dialerFocused}
        />
      );
    } else {
      keypadActions = KEYPAD_ACTIONS;
    }
    return (
      <JuiContainer CallAction={callAction} KeypadActions={keypadActions} />
    );
  }
}

const DialerContainerView = withTranslation('translations')(
  DialerContainerViewComponent,
);

export { DialerContainerView, DialPad };
