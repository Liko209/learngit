/*
 * @Author: joy.zhang (joy.zhang@ringcentral.com)
 * @Date: 2019-05-24 07:22:04
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { MessageViewProps } from './types';
import { JuiIconButton } from 'jui/components/Buttons';
import { JuiActionIconWrapper } from 'jui/pattern/Phone/VoicemailItem';

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
    const { goToConversation, entity } = this.props;
    return (
      <JuiActionIconWrapper>
        <JuiIconButton
          color="common.white"
          variant="round"
          autoFocus={false}
          size="small"
          key="message-button"
          onClick={goToConversation}
          data-test-automation-id={`${entity}-message-button`}
          tooltipTitle={this.title}
          ariaLabel={this.screenreaderText}
        >
          chat_bubble
        </JuiIconButton>
      </JuiActionIconWrapper>
    );
  }
}

const MessageView = withTranslation('translations')(MessageViewComponent);

export { MessageView };
