/*
 * @Author: isaac.liu
 * @Date: 2019-07-01 13:44:53
 * Copyright © RingCentral. All rights reserved.
 */
import { IWrapper } from './wrapper';
import { ComponentType } from 'react';
import { ReactWrapper } from 'enzyme';
import { MessageActionBar } from 'jui/pattern/MessageInput/MessageActionBar';
import { ConversationCard } from '@/modules/message/container/ConversationCard/';

class TestApp<T> {
  private _imp: IWrapper<T>;

  constructor(imp: IWrapper<T>) {
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

  // topbars
  get addMenuButton() {
    return this._imp.findWhere((wrapper: T) => {
      const w: ReactWrapper = wrapper as any;
      const f = w.prop('data-test-automation-id') === 'addMenuBtn';
      if (f) {
        console.warn(888888, w.type());
      }
      return f && w.type() === 'button';
    });
  }

  get rightRail() {
    return this._imp.findByAutomationID('rightRail', true);
  }

  get streamWrapper() {
    return this._imp.findByAutomationID('jui-stream-wrapper', true);
  }

  get stream() {
    return this._imp.findByAutomationID('jui-stream', true);
  }

  postViewByID(id?: number) {
    if (id) {
      return this._imp.findByProps({ id });
    }
    return this._imp.findByProps({ 'data-name': 'conversation-card' });
  }

  sendPost() {
    this.messageInput.enter();
  }

  find(component: ComponentType) {
    return this._imp.find(component);
  }

  flush() {
    this._imp.flush();
  }

  toString(flush: boolean = true) {
    if (flush) {
      this.flush();
    }
    return this._imp.toString();
  }
}

export { TestApp };
