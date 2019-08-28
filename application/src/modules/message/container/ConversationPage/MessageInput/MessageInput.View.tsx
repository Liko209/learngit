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
import moize from 'moize';
import { ImageDownloader } from '@/common/ImageDownloader';
import { backgroundImageFn } from 'jui/pattern/Emoji';

type Props = MessageInputProps & MessageInputViewProps & WithTranslation;
const sheetSize = 64;
const set = 'emojione';
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
  private _messageInputRef: RefObject<any> = createRef();
  private _imageDownloader: ImageDownloader;
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
    this._imageDownloader = new ImageDownloader();
    this._imageDownloader.download({
      id: -1,
      url: backgroundImageFn(set, sheetSize),
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
  };

  handleCopyPasteFile = (files: File[]) => {
    const { current } = this._attachmentsRef;
    if (current && files && files.length > 0) {
      current.vm.autoUploadFiles(files, false);
    }
  };

  handleDropFile = (files: File[]) => {
    const { current } = this._attachmentsRef;
    if (current && files && files.length > 0) {
      current.vm.autoUploadFiles(files);
    }
  };

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

  private _getToolbarNode = moize(
    (t: Props['t'], insertEmoji: Props['insertEmoji']) => (
      <MessageActionBar>
        <AttachmentView
          menus={this._getMenus()}
          fileMenu={this._getFileMenu()}
          tooltip={t('message.action.attachFile')}
          title={t('message.inputMenus.uploadFileMenuTitle')}
          onFileChanged={this._autoUploadFile}
          data-test-automation-id="message-action-bar-attachment"
        />
        <Emoji
          tooltip={t('message.emoji.emojiTooltip')}
          handleEmojiClick={insertEmoji}
          sheetSize={sheetSize}
          set={set}
        />
      </MessageActionBar>
    ),
  );

  onPostClicked = () => {
    const contents = this._messageInputRef.current.getContents();
    this.props.handleContentSent('button', contents);
  };

  private _getAttachmentsNode = moize((id: number) => (
    <Attachments
      ref={this._attachmentsRef}
      id={id}
      forceSaveDraft
      onPostClicked={this.onPostClicked}
    />
  ));

  private _getFooterNode = moize((hasInput: boolean) => (
    <InputFooter hasInput={hasInput} />
  ));

  render() {
    const {
      hasFocused,
      draft,
      contentChange,
      error,
      id,
      t,
      insertEmoji,
      hasInput,
    } = this.props;
    const { modules } = this.state;

    return (
      <JuiMessageInput
        ref={this._messageInputRef}
        data-test-automation-id="message-input"
        value={draft}
        onChange={contentChange}
        error={error ? t(error) : error}
        modules={modules}
        toolbarNode={this._getToolbarNode(t, insertEmoji)}
        footerNode={this._getFooterNode(hasInput)}
        attachmentsNode={this._getAttachmentsNode(id)}
        didDropFile={this.handleCopyPasteFile}
        placeholder={t('message.action.typeNewMessage')}
        hasFocused={hasFocused}
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
