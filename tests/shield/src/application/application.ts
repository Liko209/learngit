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
import { ConversationPage } from './ConversationPage';

type Config = {
  autoFlush: boolean;
};

class TestApp<T> {
  private _imp: IWrapper<T>;
  private _config: Config;

  constructor(imp: IWrapper<T>) {
    this._imp = imp;
    this._config = { autoFlush: true };
  }

  get leftNav() {
    this._autoFlush();
    return this._imp.findByAutomationID('leftPanel', true);
  }

  get aboutDialog() {
    this._autoFlush();
    return this._imp.findByAutomationID('about-page-dialog', true);
  }

  get messageInput() {
    this._autoFlush();
    return this._imp.findByAutomationID('message-input', true);
  }

  get messageActionBar() {
    this._autoFlush();
    return this._imp.find(MessageActionBar)[0];
  }

  get messageAttachmentButton() {
    this._autoFlush();
    return this._imp.findByAutomationID(
      'conversation-chatbar-attachment-button',
      true,
    );
  }

  get messageEmojiButton() {
    this._autoFlush();
    return this._imp.findByAutomationID(
      'conversation-chatbar-emoji-button',
      true,
    );
  }

  // topbars
  get addMenuButton() {
    this._autoFlush();
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
    this._autoFlush();
    return this._imp.findByAutomationID('rightRail', true);
  }

  get streamWrapper() {
    this._autoFlush();
    return this._imp.findByAutomationID('jui-stream-wrapper', true);
  }

  get stream() {
    this._autoFlush();
    return this._imp.findByAutomationID('jui-stream', true);
  }

  postViewByID(id?: number): ConversationPage {
    this._autoFlush();
    let result;
    if (id) {
      result = this._imp.findByProps({ id });
    }
    result = this._imp.find(ConversationCard);
    return new ConversationPage(result[0] as any);
  }

  sendPost() {
    this._autoFlush();
    this.messageInput.enter();
  }

  find(component: ComponentType) {
    this._autoFlush();
    return this._imp.find(component);
  }

  flush() {
    this._imp.flush();
  }

  private _autoFlush() {
    if (this._config.autoFlush) {
      this.flush();
    }
  }

  toString(flush: boolean = true) {
    if (flush || this._config.autoFlush) {
      this.flush();
    }
    return this._imp.toString();
  }
}

export { TestApp };
