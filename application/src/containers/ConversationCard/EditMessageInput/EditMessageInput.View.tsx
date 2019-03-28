/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-12-08 21:00:36
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { EditMessageInputViewProps } from './types';
import { JuiMessageInput } from 'jui/pattern/MessageInput';
import { extractView } from 'jui/hoc/extractView';
import { Mention } from '@/containers/ConversationPage/MessageInput/Mention';
import keyboardEventDefaultHandler from 'jui/pattern/MessageInput/keyboardEventDefaultHandler';
import { observer } from 'mobx-react';

type State = {
  modules: object;
};

@observer
class EditMessageInputViewComponent extends Component<
  EditMessageInputViewProps & WithTranslation,
  State
> {
  private _messageInputRef: React.RefObject<
    JuiMessageInput
  > = React.createRef();
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

  focusEditor = () => {
    if (this._messageInputRef.current) {
      this._messageInputRef.current.focusEditor();
    }
  }

  render() {
    const { draft, text, error, gid, t, id, saveDraft } = this.props;
    const { modules } = this.state;
    return (
      <JuiMessageInput
        ref={this._messageInputRef}
        defaultValue={draft || text}
        error={error ? t(error) : error}
        modules={modules}
        autofocus={false}
        isEditMode={true}
        onChange={saveDraft}
      >
        <Mention id={gid} pid={id} isEditMode={true} ref={this._mentionRef} />
      </JuiMessageInput>
    );
  }
}

const View = extractView<EditMessageInputViewProps & WithTranslation>(
  EditMessageInputViewComponent,
);
const EditMessageInputView = withTranslation('translations')(View);

export { EditMessageInputView, EditMessageInputViewComponent };
