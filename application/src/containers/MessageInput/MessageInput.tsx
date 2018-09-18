/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-09-13 14:37:57
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { observer } from 'mobx-react';
import JuiMessageInput from 'ui-components/MessageInput';
import ViewModel from './ViewModel';

interface IProps {
  id: number; // group id
}

@observer
class MessageInput extends Component<IProps> {
  private _vm: ViewModel;
  private _keyboardEvent: {};

  constructor(props: IProps) {
    super(props);
    this._updateKeyboardEvent = this._updateKeyboardEvent.bind(this);
    this._handleChange = this._handleChange.bind(this);

    this._vm = new ViewModel(props.id);
    this._updateKeyboardEvent();
  }

  componentDidUpdate(prevProps: IProps) {
    if (this.props.id !== prevProps.id) {
      this._vm = new ViewModel(this.props.id);
      this._updateKeyboardEvent();
      this.forceUpdate();
    }
  }

  private _updateKeyboardEvent() {
    const { getKeyboardEvent } = this._vm;
    this._keyboardEvent = getKeyboardEvent(this.props.id);
  }

  private _handleChange = (value: any, editor: any) => {
    this._vm.changeDraft(value, editor);
  }

  render() {
    const { draft, setEditor } = this._vm;
    return (
      <JuiMessageInput
        value={draft}
        onChange={this._handleChange}
        keyboardEvent={this._keyboardEvent}
        setEditor={setEditor}
      />
    );
  }
}

export { MessageInput };
