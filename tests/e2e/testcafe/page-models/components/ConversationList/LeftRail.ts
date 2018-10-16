// author = 'mia.cai@ringcentral.com'
import { ReactSelector } from 'testcafe-react-selectors';
import { BaseComponent } from '../..';
import { Selector } from 'testcafe';

class LeftRail extends BaseComponent {
  get sections() {
    return ReactSelector('ConversationListSection');
  }

  private _getSection(title: string, position: number) {
    return ReactSelector('ConversationListSection')
      .nth(position)
      .withProps('title', title);
  }

  checkSectionsOrder(...sections: string[]): this {
    const length = sections.length
    let result = this.waitFor(this.sections)
    for (let i; i < sections.length; i++){
      result.checkSectionIndex(sections[i], i)
    }
    return result
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
