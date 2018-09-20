/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-09-13 14:37:57
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { translate } from 'react-i18next';
import { TranslationFunction } from 'i18next';
import JuiMessageInput from 'ui-components/MessageInput';
import ViewModel from './ViewModel';

interface IProps {
  id: number; // group id
  t: TranslationFunction;
}

@observer
class MessageInputComponent extends Component<IProps> {
  private _vm: ViewModel = new ViewModel();

  constructor(props: IProps) {
    super(props);
    this._onChange = this._onChange.bind(this);
    this._vm.init(props.id);
  }

  componentDidUpdate(prevProps: IProps) {
    if (this.props.id !== prevProps.id) {
      this._vm.init(this.props.id);
    }
  }

  componentWillUnmount() {
    this._vm.forceSaveDraft();
  }

  private _onChange = (value: any) => {
    this._vm.changeDraft(value);
  }

  render() {
    const { draft, keyboardEventHandler, error } = this._vm;
    const { t } = this.props;
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

const MessageInput = translate('Conversations')(MessageInputComponent);

export { MessageInput };
