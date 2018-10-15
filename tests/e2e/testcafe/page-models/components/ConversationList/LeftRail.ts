// author = 'mia.cai@ringcentral.com'
import { ReactSelector } from 'testcafe-react-selectors';
import { BaseComponent } from '../..';
import { Selector } from 'testcafe';

class LeftRail extends BaseComponent {
  get sections() {
    return ReactSelector('ConversationListSection2');
  }

  private _getSection(title: string, position: number) {
    return ReactSelector('ConversationListSection')
      .nth(position)
      .withProps('title', title);
  }

  checkSectionsOrder(
    unread: string,
    mentions: string,
    bookmarks: string,
    favorites: string,
    dm: string,
    teams: string,
  ): this {
    return this.waitFor(this.sections)
      .checkSectionIndex(unread, 0)
      .checkSectionIndex(mentions, 1)
      .checkSectionIndex(bookmarks, 2)
      .checkSectionIndex(favorites, 3)
      .checkSectionIndex(dm, 4)
      .checkSectionIndex(teams, 5);
  }

  checkSectionIndex(sectionTitle: string, index: number): this {
    const section = this._getSection(sectionTitle, index);
    return this.checkExisted(section);
  }

  selectRandomConversation(): this {
    return this.chain(async (t, h) => {
      const cells = Selector('.conversation-list-item');
      const count = await cells.count;
      const n = Math.floor(Math.random() * count);
      h.log(`selecting ${n + 1}th cell`);
      const randomCell = cells.nth(n);
      return t.click(randomCell);
    });
  }

  protected waitFor(selector: Selector) {
    return this.chain(async (t: TestController) => {
      await selector;
    });
  }
}

export { LeftRail };
