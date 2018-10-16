/*
* @Author: Devin Lin (devin.lin@ringcentral.com)
* @Date: 2018-10-12 13:58:50
* Copyright © RingCentral. All rights reserved.
*/

import { Selector } from 'testcafe';
import { BaseComponent } from '../..';

class Send extends BaseComponent {
  get selectorMessageInput(): Selector {
    return Selector('.ql-editor');
  }

  private get _selectorLastConversationCard(): Selector {
    return Selector('[data-name="conversation-card"]').nth(-1);
  }

  public inputMessage(content: string): this {
    return this.chain(async t =>
      await t.typeText(this.selectorMessageInput, content),
    );
  }

  public sendMessage(): this {
    return this.chain(async t =>
      await t.click(this.selectorMessageInput).pressKey('enter'),
    );
  }

  public expectEditorHasExisted() {
    return this.chain(async (t) => {
      await t.expect(this.selectorMessageInput.exists).ok('ensure component exist', { timeout: 20000 });
    });
  }

  public expectShowMessageInConversationCard(msg: string): this {
    return this.chain(async (t) => {
      await t.expect(this._selectorLastConversationCard.textContent).contains(msg);
    });
  }

  public expectShowMessageInMessageInput(msg: string): this {
    return this.chain(async (t) => {
      await t.expect(this.selectorMessageInput.textContent).contains(msg);
    });
  }

  public selectConversation(groupId: number): this {
    return this.chain(async (t) => {
      const selectorConversation = await Selector(`[data-group-id="${groupId}"]`);
      await t.click(selectorConversation);
    });
  }
}

export { Send };
