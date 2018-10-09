/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-09-28 16:06:55
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { translate } from 'react-i18next';
import { TranslationFunction } from 'i18next';
import { MessageInputViewProps } from './types';
import { JuiMessageInput } from 'jui/pattern/MessageInput';

type Props = {
  t: TranslationFunction,
};

class MessageInputViewComponent extends Component<MessageInputViewProps & Props> {
  componentWillUnmount() {
    this.props.forceSaveDraft();
  }

  render() {
    const { draft, keyboardEventHandler, changeDraft, error, t } = this.props;
    return (
      <JuiMessageInput
        value={draft}
        onChange={changeDraft}
        keyboardEventHandler={keyboardEventHandler}
        error={error ? t(error) : error}
      />
    );
  }
}

const MessageInputView = translate('Conversations')(MessageInputViewComponent);

export { MessageInputView };
