/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2019-04-29 09:49:37
 * Copyright © RingCentral. All rights reserved.
 */
import * as React from 'react';
import { observer } from 'mobx-react';
import { ViewProps } from './types';
import { withTranslation, WithTranslation } from 'react-i18next';
import { DialerHeader } from '../DialerHeader';
import {
  JuiReply,
  JuiPreDefineMessage,
  JuiPreDefineMenuItem,
  JuiHeaderContainer,
  JuiTitleBar,
  JuiCustomReply,
} from 'jui/pattern/Dialer';
import { JuiIconButton } from 'jui/components/Buttons';
import {
  predefinedTime,
  predefinedMessage,
  filterCharacters,
  wordsLimitation,
} from './config';
import { ToastCallError } from '../../service/ToastCallError';
import {
  RTC_REPLY_MSG_PATTERN,
  RTC_REPLY_MSG_TIME_UNIT,
} from 'sdk/module/telephony';

type Props = ViewProps & WithTranslation;

@observer
class ReplyViewComponent extends React.Component<Props> {
  private _handleClickMap = {};
  private _preDefinedCallbackTimeMenuItems: any;
  private _preDefinedWillCallbackTimeMenuItems: any;
  private _handleClick = (
    pattern: RTC_REPLY_MSG_PATTERN,
    time?: number,
    timeUnit?: RTC_REPLY_MSG_TIME_UNIT,
  ) => {
    const { replyWithPattern } = this.props;

    if (time && timeUnit) {
      if (this._handleClickMap[`${pattern}${time}`]) {
        return this._handleClickMap[`${pattern}${time}`];
      }
      this._handleClickMap[`${pattern}${time}`] = () => {
        return replyWithPattern(pattern, time, timeUnit);
      };
      return this._handleClickMap[`${pattern}${time}`];
    }

    if (this._handleClickMap[pattern]) return this._handleClickMap[pattern];
    this._handleClickMap[pattern] = () => {
      return replyWithPattern(pattern);
    };
    return this._handleClickMap[pattern];
  }

  componentDidMount() {
    const { startReply } = this.props;
    this._preDefinedCallbackTimeMenuItems = this._generatePredefinedTimes(
      RTC_REPLY_MSG_PATTERN.CALL_ME_BACK_LATER,
    );
    this._preDefinedWillCallbackTimeMenuItems = this._generatePredefinedTimes(
      RTC_REPLY_MSG_PATTERN.WILL_CALL_YOU_BACK_LATER,
    );
    startReply();
  }

  private _InMeeting = () => {
    const { t } = this.props;

    return (
      <JuiPreDefineMessage
        text={t(
          `telephony.predefinedMessage.${predefinedMessage.inMeeting.label}`,
        )}
        handleClick={this._handleClick(predefinedMessage.inMeeting.pattern)}
        automationId="reply-with-in-meeting"
      />
    );
  }

  private _OnMyWay = () => {
    const { t } = this.props;

    return (
      <JuiPreDefineMessage
        text={t(
          `telephony.predefinedMessage.${predefinedMessage.onMyWay.label}`,
        )}
        handleClick={this._handleClick(predefinedMessage.onMyWay.pattern)}
      />
    );
  }
  private _generatePredefinedTimes = (pattern: RTC_REPLY_MSG_PATTERN) => {
    const { t } = this.props;

    return predefinedTime.map(({ label, unit, value }, index) => (
      <JuiPreDefineMenuItem
        onClick={this._handleClick(pattern, value, unit)}
        key={label}
        automationId={`reply-with-${index}-type-time`}
      >
        {t(`telephony.predefinedTime.${label}`)}
      </JuiPreDefineMenuItem>
    ));
  }

  private _CallBack = () => {
    const { t } = this.props;

    return (
      <JuiPreDefineMessage
        text={t(
          `telephony.predefinedMessage.${predefinedMessage.callMeBack.label}`,
        )}
      >
        {this._preDefinedCallbackTimeMenuItems}
      </JuiPreDefineMessage>
    );
  }

  private _WillCallBack = () => {
    const { t } = this.props;

    return (
      <JuiPreDefineMessage
        text={t(
          `telephony.predefinedMessage.${predefinedMessage.willCallBack.label}`,
        )}
        automationId="reply-with-will-call-back"
      >
        {this._preDefinedWillCallbackTimeMenuItems}
      </JuiPreDefineMessage>
    );
  }

  private _handleMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { storeCustomMessage } = this.props;
    storeCustomMessage(e.target.value);
  }

  private _handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const {
      setShiftKeyDown,
      shiftKeyStatus,
      customReplyMessage,
      replyWithMessage,
    } = this.props;
    if (filterCharacters.indexOf(e.key) > 0) {
      e.preventDefault();
    } else if (e.key === 'Shift') {
      setShiftKeyDown(true);
    } else if (!shiftKeyStatus && e.key === 'Enter') {
      e.preventDefault();
      if (customReplyMessage.length === 0) {
        ToastCallError.toastEmptyReplyMessage();
      } else {
        replyWithMessage();
      }
    }
  }

  private _handleKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Shift') {
      this.props.setShiftKeyDown(false);
    }
  }

  private _handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
  }

  private _handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    if (event.clipboardData) {
      const msg = event.clipboardData.getData('text/plain');
      const filteredMsg = msg.replace(
        /[\~\@\#\$\%\^\&\*\(\)\_\+\{\}\[\]\|\<\>\/]*/g,
        '',
      );
      if (msg.length !== filteredMsg.length) {
        const { storeCustomMessage, customReplyMessage } = this.props;
        let appendMessage = customReplyMessage + filteredMsg;
        if (appendMessage.length > wordsLimitation) {
          appendMessage = appendMessage.substring(0, wordsLimitation);
        }
        storeCustomMessage(appendMessage);
        event.preventDefault();
      }
    }
  }

  private _customReply = () => {
    const { t, customReplyMessage } = this.props;
    return (
      <JuiCustomReply
        id="incoming-call-custom-reply-id"
        fullWidth={true}
        placeholder={t('telephony.customReplyMessagePlaceholder')}
        inputProps={{
          maxLength: wordsLimitation,
        }}
        label={t('telephony.customReplyLabel')}
        onChange={this._handleMessageChange}
        onKeyDown={this._handleKeyDown}
        onKeyUp={this._handleKeyUp}
        draggable={false}
        onMouseDown={this._handleMouseDown}
        onPaste={this._handlePaste}
        value={customReplyMessage ? customReplyMessage : ''}
        data-test-automation-id="reply-with-custom-message"
      />
    );
  }

  private _PreDefineMessages = [
    this._InMeeting,
    this._OnMyWay,
    this._CallBack,
    this._WillCallBack,
  ];

  private _Back = () => {
    const { t, quitReply } = this.props;
    return (
      <JuiIconButton
        variant="plain"
        color="common.white"
        onClick={quitReply}
        size="large"
        tooltipTitle={t('telephony.action.back')}
        aria-label={t('telephony.action.back')}
        data-test-automation-id="reply-back-button"
      >
        previous
      </JuiIconButton>
    );
  }

  render() {
    const { t, replyCountdownTime } = this.props;

    return (
      <>
        <JuiHeaderContainer>
          <JuiTitleBar />
          <DialerHeader Back={this._Back} />
        </JuiHeaderContainer>
        <JuiReply
          PreDefines={this._PreDefineMessages}
          count={{
            time: replyCountdownTime,
            unit: t('telephony.countdownUnit'),
          }}
          countText={t('telephony.countText')}
          CustomReply={this._customReply}
        />
      </>
    );
  }
}

const ReplyView = withTranslation('translations')(ReplyViewComponent);

export { ReplyView, ReplyViewComponent };
