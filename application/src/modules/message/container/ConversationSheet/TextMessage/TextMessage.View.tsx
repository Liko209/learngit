/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-10-25 17:29:02
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import { observer } from 'mobx-react';
import { JuiConversationPostText } from 'jui/pattern/ConversationCard';
import { TextMessageViewProps } from './types';
import { withHighlight } from 'jui/hoc/withHighlight';
import { isSupportWebRTC } from '@/modules/common/container/PhoneParser/parserNumber';
import { PHONE_LINKS_CLS } from './constants';

@observer
class TextMessageViewComponent extends React.Component<TextMessageViewProps> {
  private _ref = React.createRef<any>();

  private _handlePhoneCall = async (evt: MouseEvent) => {
    const canUseTelephony = await this.props.canUseTelephony();
    const target = evt.target as HTMLAnchorElement;
    let phoneNumber = target.getAttribute('data-id');
    const parentNode = target.parentNode as HTMLElement;
    if (!phoneNumber && parentNode) {
      phoneNumber = parentNode.getAttribute('data-id');
    }
    if (isSupportWebRTC() && canUseTelephony && phoneNumber) {
      evt.preventDefault();
      this.props.directCall(phoneNumber);
    }
  }
  componentDidMount() {
    this.setPhoneLink();
  }
  setPhoneLink = async () => {
    const current = this._ref.current;
    if (!current) return;
    const canUseTelephony = await this.props.canUseTelephony();
    const phoneElements = current.getElementsByClassName(PHONE_LINKS_CLS) || [];
    for (let k = 0, len = phoneElements.length; k < len; k++) {
      const phoneLink = phoneElements[k];
      const match = phoneLink.getAttribute('data-id');
      const _href =
        canUseTelephony && isSupportWebRTC()
          ? 'javascript:;'
          : `rcmobile: ${match}`;
      phoneLink.setAttribute('href', _href);
      phoneLink.removeEventListener(
        'click',
        this._handlePhoneCall,
      );
      phoneLink.addEventListener('click', this._handlePhoneCall);
    }
  }
  componentWillUnmount() {
    const current = this._ref.current;
    if (!current) {
      return;
    }
    const phoneElements = current.getElementsByClassName(PHONE_LINKS_CLS) || [];
    for (let k = 0, len = phoneElements.length; k < len; k++) {
      phoneElements[k].removeEventListener(
        'click',
        this._handlePhoneCall,
      );
    }
  }
  render() {
    const { html } = this.props;
    if (html) {
      return (
        <React.Fragment>
          <JuiConversationPostText
            data-name="text"
            html={html}
            ref={this._ref}
          />
        </React.Fragment>
      );
    }
    return null;
  }
}

const TextMessageView = withHighlight(['html'])(TextMessageViewComponent);
export { TextMessageView };
