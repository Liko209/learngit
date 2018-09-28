/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-09-28 16:06:55
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { translate } from 'react-i18next';
import { MessageInputViewProps } from './types';
import JuiMessageInput from 'ui-components/MessageInput';

class MessageInputViewComponent extends Component<MessageInputViewProps> {
  constructor(props: MessageInputViewProps) {
    super(props);
    this._onChange = this._onChange.bind(this);
    props.init(props.id);
  }

  componentDidUpdate(prevProps: MessageInputViewProps) {
    if (this.props.id !== prevProps.id) {
      this.props.init(this.props.id);
    }
  }

  componentWillUnmount() {
    this.props.forceSaveDraft();
  }

  private _onChange = (value: any) => {
    this.props.changeDraft(value);
  }

  render() {
    const { draft, keyboardEventHandler, error, t } = this.props;
    return (
      <JuiMessageInput
        value={draft}
        onChange={this._onChange}
        keyboardEventHandler={keyboardEventHandler}
        error={error ? t(error) : error}
      />
    );
  }
}

const MessageInputView = translate('Conversations')(MessageInputViewComponent);

export { MessageInputView };
