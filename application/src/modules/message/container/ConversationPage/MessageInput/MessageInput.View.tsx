/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-09-28 16:06:55
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component, RefObject, createRef } from 'react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { MessageInputViewProps, MessageInputProps } from './types';
import { JuiMessageInput } from 'jui/pattern/MessageInput';
import { Mention } from './Mention';
import keyboardEventDefaultHandler from 'jui/pattern/MessageInput/keyboardEventDefaultHandler';
import { observer } from 'mobx-react';
import { MessageActionBar } from 'jui/pattern/MessageInput/MessageActionBar';
import { AttachmentView } from 'jui/pattern/MessageInput/Attachment';
import { Emoji } from '@/modules/emoji';
import { Attachments } from './Attachments';
import { extractView } from 'jui/hoc/extractView';

type Props = MessageInputProps & MessageInputViewProps & WithTranslation;
@observer
class MessageInputViewComponent extends Component<
  Props,
  {
    modules: object;
  }
> {
  private _mentionRef: RefObject<any> = createRef();
  private _attachmentsRef: RefObject<any> = createRef();
  private _emojiRef: RefObject<any> = createRef();

  state = {
    modules: {},
  };

  componentDidMount() {
    this.updateModules();
    this.props.addOnPostCallback(() => {
      const { current } = this._attachmentsRef;
      if (current) {
        current.vm.cleanFiles();
      }
    });
  }

  componentWillUnmount() {
    this.props.forceSaveDraft();
  }

  componentWillReceiveProps(nextProps: Props) {
    if (this.props.id !== nextProps.id) {
      this.props.cellWillChange(nextProps.id, this.props.id);
    }
  }

  updateModules() {
    const emoji = this._emojiRef.current;
    const mention = this._mentionRef.current;
    const { keyboardEventHandler } = this.props;
    this.setState({
      modules: {
        toolbar: false,
        keyboard: {
          bindings: {
            ...keyboardEventHandler,
            ...keyboardEventDefaultHandler,
          },
        },
        mention: mention.vm.mentionOptions,
        emoji: emoji.vm.emojiOptions,
      },
    });
  }

  private _autoUploadFile = (files: FileList) => {
    const array: File[] = [];
    for (let i = 0; i < files.length; ++i) {
      array.push(files[i]);
    }
    const { current } = this._attachmentsRef;
    if (current) {
      current.vm.autoUploadFiles(array);
    }
  }

  handleCopyPasteFile = (files: File[]) => {
    const { current } = this._attachmentsRef;
    if (current && files && files.length > 0) {
      current.vm.autoUploadFiles(files, false);
    }
  }

  handleDropFile = (files: File[]) => {
    const { current } = this._attachmentsRef;
    if (current && files && files.length > 0) {
      current.vm.autoUploadFiles(files);
    }
  }

  render() {
    const { draft, contentChange, error, id, t, insertEmoji } = this.props;
    const { modules } = this.state;
    const toolbarNode = (
      <MessageActionBar>
        <AttachmentView
          onFileChanged={this._autoUploadFile}
          data-test-automation-id="message-action-bar-attachment"
        />
        <Emoji
          handleEmojiClick={insertEmoji}
          sheetSize={64}
          set="emojione"
          ref={this._emojiRef}
        />
      </MessageActionBar>
    );
    const attachmentsNode = (
      <Attachments ref={this._attachmentsRef} id={id} forceSaveDraft={true} />
    );
    return (
      <JuiMessageInput
        value={draft}
        onChange={contentChange}
        error={error ? t(error) : error}
        modules={modules}
        id={id}
        toolbarNode={toolbarNode}
        attachmentsNode={attachmentsNode}
        didDropFile={this.handleCopyPasteFile}
      >
        <Mention id={id} ref={this._mentionRef} />
      </JuiMessageInput>
    );
  }
}

const view = extractView<WithTranslation & MessageInputViewProps>(
  MessageInputViewComponent,
);
const MessageInputView = withTranslation('translations')(view);

export { MessageInputView, MessageInputViewComponent };
