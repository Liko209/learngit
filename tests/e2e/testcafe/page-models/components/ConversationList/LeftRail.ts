// author = 'mia.cai@ringcentral.com'
import { ReactSelector } from 'testcafe-react-selectors';
import { BaseComponent } from '../..';

class LeftRail extends BaseComponent {
  get sections() {
    return ReactSelector('ConversationListSection2');
  }

  private _getSection(title: string, position: number) {
    return ReactSelector('ConversationListSection')
      .nth(position)
      .withProps('title', title);
  }

  checkSectionsOrder(unread: string, mentions: string, bookmarks: string, favorites: string, dm: string, teams: string): this {
    return this
      .waitFor(this.sections)
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

  protected waitFor(selector: Selector) {
    return this.chain(async (t) => {
      await selector;
    });
  }
}

export { LeftRail };
