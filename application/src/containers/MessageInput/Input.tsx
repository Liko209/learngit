/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-09-13 14:37:57
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { observer } from 'mobx-react';
import MessageInput from 'ui-components/MessageInput';
import ViewModel from './ViewModel';

interface IProps {
  id: number; // group id
}

@observer
class Input extends Component<IProps> {
  private _vm: ViewModel;

  constructor(props: IProps) {
    super(props);
    this._vm = new ViewModel(props.id);
  }

  componentDidUpdate(prevProps: IProps) {
    if (this.props.id !== prevProps.id) {
      this._vm = new ViewModel(this.props.id);
      this.forceUpdate();
    }
  }

  handleChange = (value: any) => {
    this._vm.changeDraft(value);
  }

  render() {
    const { draft } = this._vm;
    console.log(draft);
    return <MessageInput value={draft} onChange={this.handleChange} />;
  }
}

export { Input };
