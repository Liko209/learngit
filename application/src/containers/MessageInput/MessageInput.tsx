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

  private _onChange = (value: any) => {
    this._vm.changeDraft(value);
  }

  render() {
    const { draft, keyboardEventHandler } = this._vm;
    return (
      <JuiMessageInput
        value={draft}
        onChange={this._onChange}
        keyboardEventHandler={keyboardEventHandler}
      />
    );
  }
}

export { MessageInput };
