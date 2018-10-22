// author = 'mia.cai@ringcentral.com'
import { ReactSelector } from 'testcafe-react-selectors';
import { BaseComponent } from '../../index';
import { runInThisContext } from 'vm';

export class MaxConversation extends BaseComponent {
  get sections() {
    return ReactSelector('ConversationListSection');
  }

  waitForSections() {
    return this.chain(async (t: TestController) => await this.sections);
  }

  checkConversationCount(section: string, expectCount: number) {
    return this.chain(async (t: TestController) => {
      const items = await this._getSectionListItem(section);
      await t.expect(items.count).eql(expectCount);
    });
  }

  getConversationCount(section: string) {
    return this.chain(async (t: TestController) => {
      return await this._getSectionListItem(section).count;
    });
  }

  checkConversationListItems(section: string, itemTitles: string[]) {
    return this.chain(async (t, h) => {
      for (let i = 0; i < itemTitles.length - 1; i += 1) {
        const item: Selector = this._getSectionListItem(section)
          .nth(i)
          .withProps('title', itemTitles[i]);
        await item;
        await h.log(itemTitles[i]);
        await t.expect(item.exists).ok(`${itemTitles[i]} ${i}`);
      }
    });
  }

  private _getSectionListItem(section: string): Selector {
    return this.sections
      .withProps('title', section)
      .findReact('ConversationListItem');
  }
}
