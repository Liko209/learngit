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
import { ColonEmoji } from './ColonEmoji';
import keyboardEventDefaultHandler from 'jui/pattern/MessageInput/keyboardEventDefaultHandler';
import { observer } from 'mobx-react';
import { MessageActionBar } from 'jui/pattern/MessageInput/MessageActionBar';
import { AttachmentView } from 'jui/pattern/MessageInput/Attachment';
import { InputFooter } from './InputFooter';
import { Emoji } from '@/modules/emoji';
import { Attachments } from './Attachments';
import { extractView } from 'jui/hoc/extractView';
import { ImageDownloader } from '@/common/ImageDownloader';
import { IImageDownloadedListener } from 'sdk/pal';
import { PRELOAD_ITEM } from './ColonEmoji/constants';
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
  private _imageDownloader: ImageDownloader;
  private _listner: IImageDownloadedListener;
  state = {
    modules: {},
  };

  componentDidMount() {
    this._imageDownloader = new ImageDownloader();
    this.updateModules();
    this.props.addOnPostCallback(() => {
      const { current } = this._attachmentsRef;
      if (current) {
        current.vm.cleanFiles();
      }
    });
    this._imageDownloader.download(PRELOAD_ITEM, this._listner);
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
        emoji: emoji.vm.colonEmojiOptions,
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

  private _getMenus() {
    const { t } = this.props;

    return [
      {
        icon: 'google',
        label: t('message.inputMenus.google'),
      },
      {
        icon: 'dropbox',
        label: t('message.inputMenus.dropbox'),
      },
      {
        icon: 'box',
        label: t('message.inputMenus.box'),
      },
      {
        icon: 'evernote',
        label: t('message.inputMenus.evernote'),
      },
      {
        icon: 'onedrive',
        label: t('message.inputMenus.onedrive'),
      },
    ];
  }

  private _getFileMenu() {
    const { t } = this.props;

    return {
      icon: 'computer',
      label: t('message.inputMenus.computer'),
    };
  }

  render() {
    const {
      draft,
      contentChange,
      error,
      id,
      t,
      insertEmoji,
      hasInput,
    } = this.props;
    const { modules } = this.state;

    const toolbarNode = (
      <MessageActionBar>
        <AttachmentView
          menus={this._getMenus()}
          fileMenu={this._getFileMenu()}
          tooltip={t('message.action.attachFile')}
          title={t('message.inputMenus.uploadFileMenuTitle')}
          onFileChanged={this._autoUploadFile}
          data-test-automation-id="message-action-bar-attachment"
        />
        <Emoji handleEmojiClick={insertEmoji} sheetSize={64} set="emojione" />
      </MessageActionBar>
    );
    const attachmentsNode = (
      <Attachments ref={this._attachmentsRef} id={id} forceSaveDraft={true} />
    );
    const footerNode = <InputFooter hasInput={hasInput} />;
    return (
      <JuiMessageInput
        value={draft}
        onChange={contentChange}
        error={error ? t(error) : error}
        modules={modules}
        id={id}
        toolbarNode={toolbarNode}
        footerNode={footerNode}
        attachmentsNode={attachmentsNode}
        didDropFile={this.handleCopyPasteFile}
        placeholder={t('message.action.typeNewMessage')}
      >
        <Mention id={id} ref={this._mentionRef} />
        <ColonEmoji id={id} ref={this._emojiRef} />
      </JuiMessageInput>
    );
  }
}

const view = extractView<WithTranslation & MessageInputViewProps>(
  MessageInputViewComponent,
);
const MessageInputView = withTranslation('translations')(view);

export { MessageInputView, MessageInputViewComponent };
