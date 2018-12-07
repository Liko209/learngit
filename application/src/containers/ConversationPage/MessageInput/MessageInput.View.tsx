/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-09-28 16:06:55
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { translate, WithNamespaces } from 'react-i18next';
import { MessageInputViewProps } from './types';
import { JuiMessageInput } from 'jui/pattern/MessageInput';
import { Mention } from './Mention';
import keyboardEventDefaultHandler from 'jui/pattern/MessageInput/keyboardEventDefaultHandler';
import { observer } from 'mobx-react';
import { MessageActionBar } from 'jui/pattern/MessageInput/MessageActionBar';
import { AttachmentView } from 'jui/pattern/MessageInput/Attachment';
import { AttachmentList } from 'jui/pattern/MessageInput/AttachmentList';

@observer
class MessageInputViewComponent extends Component<
  MessageInputViewProps & WithNamespaces,
  {
    modules: object;
    files: File[];
  }
> {
  private _mentionRef: React.RefObject<any> = React.createRef();

  state = {
    modules: {},
    files: [],
  };

  private _autoUploadFile = async (files: FileList) => {
    if (files.length > 0) {
      const array: File[] = this.state.files.slice(0);
      for (let i = 0; i < files.length; ++i) {
        const file = files[i];
        const exists = await this.props.isFileExists(file);
        if (exists) {
          // TODO
        } else {
          array.push(file);
          await this.props.uploadFile(file);
        }
      }
      this.setState({ files: array });
    }
  }

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

  private _cancelUploadFile = (file: File) => {
    const { files } = this.state;
    const index = files.findIndex(looper => looper === file);
    if (index >= 0) {
      const newFiles = files.slice(0);
      newFiles.splice(index, 1);
      this.setState({ files: newFiles });
      this.props.cancelUploadFile(index);
    }
  }

  render() {
    const { draft, changeDraft, error, id, t } = this.props;
    const { modules, files } = this.state;
    const toolbarNode = (
      <MessageActionBar>
        <AttachmentView onFileChanged={this._autoUploadFile} />
      </MessageActionBar>
    );
    const attachmentsNode = (
      <AttachmentList files={files} cancelUploadFile={this._cancelUploadFile} />
    );
    return (
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
    );
  }
}

const MessageInputView = translate('Conversations')(MessageInputViewComponent);

export { MessageInputView };
