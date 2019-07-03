/*
 * @Author: isaac.liu
 * @Date: 2019-07-01 13:44:53
 * Copyright © RingCentral. All rights reserved.
 */
import { IWrapper } from './wrapper';
import { ComponentType } from 'react';
import ReactQuill from 'react-quill';
import { MessageActionBar } from 'jui/pattern/MessageInput/MessageActionBar';

class TestApp {
  private _imp: IWrapper;

  constructor(imp: IWrapper) {
    this._imp = imp;
  }

  get leftNav() {
    return this._imp.findByAutomationID('leftPanel', true);
  }

  get aboutDialog() {
    return this._imp.findByAutomationID('about-page-dialog', true);
  }

  get messageInput() {
    return this._imp.findByAutomationID('message-input', true);
  }

  get messageActionBar() {
    return this._imp.find(MessageActionBar)[0];
  }

  get messageAttachmentButton() {
    return this._imp.findByAutomationID(
      'conversation-chatbar-attachment-button',
      true,
    );
  }

  get messageEmojiButton() {
    return this._imp.findByAutomationID(
      'conversation-chatbar-emoji-button',
      true,
    );
  }

  sendPost() {
    this.messageInput
      .find(ReactQuill)
      .forEach((wrapper: IWrapper) => wrapper.enter());
  }

  find(component: ComponentType) {
    return this._imp.find(component);
  }

  flush() {
    this._imp.flush();
  }

  toString() {
    return this._imp.toString();
  }
}

export { TestApp };
