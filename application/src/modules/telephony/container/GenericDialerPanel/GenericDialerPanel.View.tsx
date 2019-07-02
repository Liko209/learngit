/*
 * @Author: Lex Huang (lex.huang@ringcentral.com)
 * @Date: 2019-06-26 13:25:46
 * Copyright © RingCentral. All rights reserved.
 */

import React, { RefObject, createRef } from 'react';
import { observer } from 'mobx-react';
import {
  DialPad,
  JuiHeaderContainer,
  JuiHeader,
  JuiContainer,
  ContactSearchContainer,
} from 'jui/pattern/Dialer';
import {
  GenericDialerPanelViewProps,
  GenericDialerPanelViewState,
} from './types';
import { DialerTitleBar } from '../DialerTitleBar';
import { withTranslation, WithTranslation } from 'react-i18next';
import { CallerIdSelector } from '../CallerIdSelector';
import { debounce } from 'lodash';
import { focusCampo } from '../../helpers';
import ReactDOM from 'react-dom';
import { ContactSearchList } from '../ContactSearchList';

const CLOSE_TOOLTIP_TIME = 5000;

type Props = WithTranslation & GenericDialerPanelViewProps;

@observer
class GenericDialerPanelViewComponent extends React.Component<
  Props,
  GenericDialerPanelViewState
> {
  private _dialerHeaderRef: RefObject<any> = createRef();
  private _timer: NodeJS.Timeout;
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
    this.props.onAfterDialerOpen && this.props.onAfterDialerOpen();
    this._focusInput();
  }

  componentWillUnmount() {
    if (this._timer) {
      clearTimeout(this._timer);
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

  private _clickToInput = (args: any) => {
    this.props.clickToInput(args);

    if (this.props.inputString) {
      this._focusInput();
    }
  }

  private _focusInput = () => {
    if (!this._dialerHeaderRef.current) {
      return;
    }
    const input = (ReactDOM.findDOMNode(
      this._dialerHeaderRef.current,
    ) as HTMLDivElement).querySelector('input');

    this._focusCampo(input);
  }

  private _focusCampo = debounce(focusCampo, 30, {
    leading: false,
    trailing: true,
  });

  private _getCallerIdProps = () => {
    const {
      callerPhoneNumberList,
      chosenCallerPhoneNumber,
      shouldCloseToolTip,
      enteredDialer,
    } = this.props;

    const { shouldShowToolTip } = this.state;

    return {
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
  }

  private _renderCallerIdSelector = () => {
    const callerIdProps = this._getCallerIdProps();
    return <CallerIdSelector {...callerIdProps} />;
  }

  private _renderDialer = () => {
    const {
      playAudio,
      dialerInputFocused,
      displayCallerIdSelector,
    } = this.props;

    return (
      <>
        {displayCallerIdSelector && this._renderCallerIdSelector()}
        <DialPad
          makeMouseEffect={this._clickToInput}
          makeKeyboardEffect={playAudio}
          shouldHandleKeyboardEvts={dialerInputFocused}
        />
      </>
    );
  }

  private _renderContactSearch = () => {
    const {
      displayCallerIdSelector,
      onContactSelected,
      inputStringProps,
    } = this.props;
    return (
      <ContactSearchContainer>
        {displayCallerIdSelector && this._renderCallerIdSelector()}
        <ContactSearchList
          onContactSelected={onContactSelected}
          inputStringProps={inputStringProps}
        />
      </ContactSearchContainer>
    );
  }

  render() {
    const {
      dialerInputFocused,
      inputString,
      onKeyDown,
      deleteAllInputString,
      t,
      onChange,
      onFocus,
      onBlur,
      deleteInputString,
      shouldEnterContactSearch,
      CallActionBtn,
      Back,
    } = this.props;

    const callActionBtn = shouldEnterContactSearch ? undefined : CallActionBtn;

    return (
      <>
        <JuiHeaderContainer>
          <DialerTitleBar />
          <JuiHeader
            showDialerInputField={true}
            onChange={onChange}
            onFocus={onFocus}
            onBlur={onBlur}
            focus={dialerInputFocused}
            placeholder={t('telephony.dialerPlaceholder')}
            ariaLabelForDelete={t('telephony.delete')}
            deleteAllInputString={deleteAllInputString}
            deleteInputString={deleteInputString}
            onKeyDown={onKeyDown}
            dialerValue={inputString}
            Back={Back}
            ref={this._dialerHeaderRef}
          />
        </JuiHeaderContainer>
        <JuiContainer
          removePadding={shouldEnterContactSearch}
          keypadFullSize={shouldEnterContactSearch}
          CallAction={callActionBtn}
          onFocus={this._focusInput}
          KeypadActions={
            shouldEnterContactSearch
              ? this._renderContactSearch()
              : this._renderDialer()
          }
        />
      </>
    );
  }
}

const GenericDialerPanelView = withTranslation('translations')(
  GenericDialerPanelViewComponent,
);

export { GenericDialerPanelView, DialPad };
