/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-12-08 21:00:36
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { translate, WithNamespaces } from 'react-i18next';
import { EditMessageInputViewProps } from './types';
import { JuiMessageInput } from 'jui/pattern/MessageInput';
import { Mention } from '@/containers/ConversationPage/MessageInput/Mention';
import keyboardEventDefaultHandler from 'jui/pattern/MessageInput/keyboardEventDefaultHandler';
import { observer } from 'mobx-react';

type State = {
  modules: object;
};

@observer
class EditMessageInputViewComponent extends Component<
  EditMessageInputViewProps & WithNamespaces,
  State
> {
  private _mentionRef: React.RefObject<any> = React.createRef();

  state = {
    modules: {},
  };

  componentDidMount() {
    this.updateModules();
  }

  updateModules() {
    const mention = this._mentionRef.current;
    const { keyboardEventHandler } = this.props;
    this.setState({
      modules: {
        toolbar: false,
        keyboard: {
          bindings: { ...keyboardEventHandler, ...keyboardEventDefaultHandler },
        },
        mention: mention.vm.mentionOptions,
      },
    });
  }

  render() {
    const { text, error, gid, t, id } = this.props;
    const { modules } = this.state;
    return (
      <JuiMessageInput
        defaultValue={text}
        error={error ? t(error) : error}
        modules={modules}
        isEditMode={true}
      >
        <Mention id={gid} pid={id} isEditMode={true} ref={this._mentionRef} />
      </JuiMessageInput>
    );
  }
}

const EditMessageInputView = translate('translations')(
  EditMessageInputViewComponent,
);

export { EditMessageInputView };
