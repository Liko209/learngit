/*
 * @Author: joy.zhang (joy.zhang@ringcentral.com)
 * @Date: 2019-05-24 07:22:04
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { ActionButton } from 'jui/pattern/Phone/VoicemailItem';
import { withTranslation, WithTranslation } from 'react-i18next';
import { MessageViewProps } from './types';

type Props = MessageViewProps & WithTranslation;

@observer
class MessageViewComponent extends Component<Props> {
  get title() {
    const { t } = this.props;
    return t('message.message');
  }

  get screenreaderText() {
    const { t } = this.props;
    return t('common.goToConversation');
  }

  render() {
    const { goToConversation, entity, type } = this.props;
    return (
      <ActionButton
        key="message-button"
        icon="chat_bubble"
        type={type}
        tooltip={this.title}
        onClick={goToConversation}
        screenReader={this.screenreaderText}
        automationId={`${entity}-message-button`}
      />
    );
  }
}

const MessageView = withTranslation('translations')(MessageViewComponent);

export { MessageView };
