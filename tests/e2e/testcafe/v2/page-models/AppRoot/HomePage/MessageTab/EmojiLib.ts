import * as _ from 'lodash';
import * as assert from 'assert'
import { BaseWebComponent } from '../../../BaseWebComponent';
import { h, H } from '../../../../helpers';



class EmojiLib extends BaseWebComponent {
  get self() {
    return this.getSelectorByAutomationId(''); // todo
  }

  async clickRandomEmoji() {
    const count = await this.emojis.count;
    const n = Math.floor(Math.random() * count);
    await this.t.click(this.emojis.nth(n))
  }

  get emojis() {
    return this.getSelectorByAutomationId(''); // todo
  }

  get header() {
    return // todo
  }

  emojiByText(text: string) {
    return  // todo
  }

}

class EmojiSection extends BaseWebComponent {
  get emojis() {
    return this.getSelectorByAutomationId(''); // todo
  }

  async clickRandomEmoji() {
    const count = await this.emojis.count;
    const n = Math.floor(Math.random() * count);
    await this.t.click(this.emojis.nth(n))
  }
}
