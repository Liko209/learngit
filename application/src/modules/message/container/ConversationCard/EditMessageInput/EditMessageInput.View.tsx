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
import { Mention } from '@/modules/message/container/ConversationPage/MessageInput/Mention';
import keyboardEventDefaultHandler from 'jui/pattern/MessageInput/keyboardEventDefaultHandler';
import { observer } from 'mobx-react';
import { handleAtMention } from 'jui/pattern/MessageInput/Mention/handleAtMention';
import { container } from 'framework';
import { MESSAGE_SERVICE } from '@/modules/message/interface/constant';
import { MessageService } from '@/modules/message/service';
import { reaction, IReactionDisposer } from 'mobx';

type State = {
  modules: object;
};
type Props = EditMessageInputViewProps & WithTranslation;
@observer
class EditMessageInputViewComponent extends Component<Props, State> {
  private _messageInputRef: React.RefObject<
    JuiMessageInput
  > = React.createRef();
  private _mentionRef: React.RefObject<any> = React.createRef();
  private _messageService = container.get<MessageService>(MESSAGE_SERVICE);
  private _disposer: IReactionDisposer;
  state = {
    modules: {},
  };
  constructor(props: Props) {
    super(props);
    this._disposer = reaction(
      () => this._messageService.getCurrentInputFocus() === this.props.id,
      (shouldFocus: boolean) => {
        shouldFocus && this.focusEditor();
      },
    );
  }

  componentDidMount() {
    this.updateModules();
  }
  componentWillUnmount() {
    this._messageService.blurEditInputFocus();
    this._disposer();
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

  blurHandler = () => {
    this._messageService.blurEditInputFocus();
  }

  render() {
    const { draft, text, error, gid, t, id, saveDraft } = this.props;
    const { modules } = this.state;
    return (
      <JuiMessageInput
        ref={this._messageInputRef}
        defaultValue={draft || handleAtMention(text)}
        error={error ? t(error) : error}
        modules={modules}
        autofocus={false}
        isEditMode={true}
        onChange={saveDraft}
        onBlur={this.blurHandler}
        placeholder={t('message.action.typeNewMessage')}
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
