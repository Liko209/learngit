// author = 'mia.cai@ringcentral.com'
import { ReactSelector } from 'testcafe-react-selectors';
import { BasePage } from '../../BasePage';

class LeftRail extends BasePage {
  get sections() {
    return ReactSelector('ConversationListSection');
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
    return this.checkExist(section);
  }
}

export { LeftRail };
