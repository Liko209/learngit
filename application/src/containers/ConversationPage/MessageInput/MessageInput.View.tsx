/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-09-28 16:06:55
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component, RefObject, createRef } from 'react';
import { translate, WithNamespaces } from 'react-i18next';
import { MessageInputViewProps } from './types';
import { JuiMessageInput } from 'jui/pattern/MessageInput';
import { Mention } from './Mention';
import keyboardEventDefaultHandler from 'jui/pattern/MessageInput/keyboardEventDefaultHandler';
import { observer } from 'mobx-react';
import { MessageActionBar } from 'jui/pattern/MessageInput/MessageActionBar';
import { AttachmentView } from 'jui/pattern/MessageInput/Attachment';
import { Attachments } from './Attachments';

@observer
class MessageInputViewComponent extends Component<
  MessageInputViewProps & WithNamespaces,
  {
    modules: object;
  }
> {
  private _mentionRef: RefObject<any> = createRef();
  private _attachmentsRef: RefObject<any> = createRef();

  state = {
    modules: {},
  };

  componentDidMount() {
    this.updateModules();
  }

  componentWillUnmount() {
    this.props.forceSaveDraft();
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

  render() {
    const { draft, changeDraft, error, id, t } = this.props;
    const { modules } = this.state;
    const toolbarNode = (
      <MessageActionBar>
        <AttachmentView
          onFileChanged={this._autoUploadFile}
          data-test-automation-id="message-action-bar-attachment"
        />
      </MessageActionBar>
    );
    const attachmentsNode = (
      <Attachments
        ref={this._attachmentsRef}
        id={id}
        attachmentsObserver={this.props.updateAttachmentItems}
      />
    );

    return (
      <>
        <JuiMessageInput
          value={draft}
          onChange={changeDraft}
          error={error ? t(error) : error}
          modules={modules}
          toolbarNode={toolbarNode}
          attachmentsNode={attachmentsNode}
        >
          <Mention id={id} ref={this._mentionRef} />
        </JuiMessageInput>
      </>
    );
  }
}

const MessageInputView = translate('Conversations')(MessageInputViewComponent);

export { MessageInputView };
