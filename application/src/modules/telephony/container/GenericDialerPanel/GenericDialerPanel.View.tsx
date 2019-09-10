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
  RecentCallContainer,
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
import { RecentCalls } from '../RecentCalls';
import { RecentCallBtn } from '../RecentCallBtn';

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
  private _focusCampo = debounce(focusCampo, 30, {
    leading: false,
    trailing: true,
  });
  componentDidMount() {
    this.props.onAfterDialerOpen && this.props.onAfterDialerOpen();
    this._focusInput();
  }

  componentDidUpdate(prevProps: Props) {
    const { enteredDialer, shouldDisplayRecentCalls } = this.props;
    const { shouldShowToolTip } = this.state;
    if (enteredDialer && shouldShowToolTip) {
      clearTimeout(this._timer);
      this._timer = setTimeout(this._handleCloseToolTip, CLOSE_TOOLTIP_TIME);
    }
    if (shouldDisplayRecentCalls !== prevProps.shouldDisplayRecentCalls) {
      this._focusInput();
    }
  }
  componentWillUnmount() {
    if (this._timer) {
      clearTimeout(this._timer);
    }
  }
  _onChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = event.target;
    this.props.setCallerPhoneNumber(value);
  };
  private _handleCloseToolTip = () => {
    const { enteredDialer } = this.props;
    enteredDialer &&
      this.setState({
        shouldShowToolTip: false,
      });
  };

  private _clickToInput = (args: any) => {
    this.props.clickToInput(args);
    this._focusInput();
  };

  private _focusInput = () => {
    if (!this._dialerHeaderRef.current) {
      return;
    }
    /* eslint-disable react/no-find-dom-node */
    const input = (ReactDOM.findDOMNode(
      this._dialerHeaderRef.current,
    ) as HTMLDivElement).querySelector('input');

    this._focusCampo(input);
  };

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
  };

  private _renderCallerIdSelector = () => {
    const callerIdProps = this._getCallerIdProps();
    return <CallerIdSelector {...callerIdProps} />;
  };

  private _renderDialer = () => {
    const { playAudio, dialerInputFocused } = this.props;

    return (
      <DialPad
        makeMouseEffect={this._clickToInput}
        makeKeyboardEffect={playAudio}
        shouldHandleKeyboardEvts={dialerInputFocused}
      />
    );
  };

  private _renderContactSearch = () => {
    const {
      onContactSelected,
      inputStringProps,
      displayCallerIdSelector,
    } = this.props;
    return (
      <ContactSearchContainer addMargin={displayCallerIdSelector}>
        <ContactSearchList
          onContactSelected={onContactSelected}
          inputStringProps={inputStringProps}
        />
      </ContactSearchContainer>
    );
  };

  private _renderRecentCalls = () => {
    const { displayCallerIdSelector } = this.props;
    return (
      <RecentCallContainer>
        <RecentCalls displayCallerIdSelector={displayCallerIdSelector} />
      </RecentCallContainer>
    );
  };

  private _renderKeypadActions = () => {
    const { shouldEnterContactSearch, shouldDisplayRecentCalls } = this.props;
    switch (true) {
      case shouldEnterContactSearch:
        return this._renderContactSearch();

      case shouldDisplayRecentCalls:
        return this._renderRecentCalls();

      default:
        return this._renderDialer();
    }
  };

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
      displayCallerIdSelector,
      shouldDisplayRecentCalls,
      CallActionBtn,
      Back,
      isTransferPage,
    } = this.props;

    const callActionBtn =
      (shouldEnterContactSearch || shouldDisplayRecentCalls) && !isTransferPage
        ? undefined
        : CallActionBtn;

    return (
      <>
        <JuiHeaderContainer>
          <DialerTitleBar />
          <JuiHeader
            showDialerInputField
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
            Back={!shouldEnterContactSearch ? Back : undefined}
            RecentCallBtn={
              !shouldEnterContactSearch ? RecentCallBtn : undefined
            }
            ref={this._dialerHeaderRef}
          />
        </JuiHeaderContainer>
        <JuiContainer
          removePadding={shouldEnterContactSearch || shouldDisplayRecentCalls}
          keypadFullSize={shouldEnterContactSearch || shouldDisplayRecentCalls}
          CallAction={callActionBtn}
          onFocus={this._focusInput}
          CallerIdSelector={
            displayCallerIdSelector ? this._renderCallerIdSelector() : null
          }
          KeypadActions={this._renderKeypadActions()}
        />
      </>
    );
  }
}

const GenericDialerPanelView = withTranslation('translations')(
  GenericDialerPanelViewComponent,
);

export { GenericDialerPanelView, DialPad };
