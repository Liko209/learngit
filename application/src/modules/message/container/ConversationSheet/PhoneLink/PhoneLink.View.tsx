/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2019-05-27 10:20:52
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { PhoneLinkViewProps } from './types';
import { JuiConversationNumberLink } from 'jui/pattern/ConversationCard';
import { handleHrefAttribute, isSupportWebRTC } from './helper';
import { observer } from 'mobx-react';
import { JuiItemTextValue } from 'jui/pattern/ConversationItemCard/ConversationItemCardBody';

@observer
class PhoneLinkView extends React.Component<PhoneLinkViewProps> {
  async componentDidMount() {
    await this.props.updateCanUseTelephony();
  }

  private _handlePhoneClick = async (
    evt: React.MouseEvent<HTMLAnchorElement>,
  ) => {
    const { canUseTelephony, isRCUser, directCall, text } = this.props;
    if (canUseTelephony && isSupportWebRTC()) {
      evt.preventDefault();
      if (isRCUser) {
        directCall(text);
      }
    }
  };

  private _handleConferenceClick = (
    evt: React.MouseEvent<HTMLAnchorElement>,
  ) => {
    const { handleClick } = this.props;
    if (isSupportWebRTC() && handleClick) {
      evt.preventDefault();
      handleClick('link');
    }
  };

  render() {
    const {
      canUseTelephony,
      text,
      key,
      isRCUser,
      canUseConference,
      type,
      ...rest
    } = this.props;
    const href = handleHrefAttribute({
      canUseTelephony,
      content: text,
    });

    if (type === 'conference') {
      return canUseConference ? (
        <JuiConversationNumberLink
          href={href}
          key={key}
          data-test-automation-id="audioConferenceLink"
          onClick={this._handleConferenceClick}
          data-id={text}
          {...rest}
        />
      ) : (
        <JuiItemTextValue description={text} />
      );
    }

    return isRCUser ? (
      <JuiConversationNumberLink
        href={href}
        key={key}
        data-test-automation-id="phoneNumberLink"
        onClick={this._handlePhoneClick}
        data-id={text}
        {...rest}
      />
    ) : (
      text
    );
  }
}

export { PhoneLinkView };
