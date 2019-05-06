import * as _ from 'lodash';
import * as assert from 'assert'
import { BaseWebComponent } from '../../../BaseWebComponent';
import { h, H } from '../../../../helpers';


export class EmojiLib extends BaseWebComponent {
  get self() {
    return this.getSelectorByAutomationId('conversation-chatbar-emoji-menu');
  }

  async clickRandomEmoji() {
    const count = await this.emojis.count;
    const n = Math.floor(Math.random() * count);
    await this.t.click(this.emojis.nth(n))
  }

  get emojis() {
    return this.self.find('.emoji-mart-emoji');
  }

  getEmojiByKey(key: string) {
    const emojiRegExp = new RegExp(`.*, ${key}`)
    return this.emojis.withAttribute('aria-label', emojiRegExp);
  }

  async clickEmojiByKey(key: string) {
    await this.t.click(this.getEmojiByKey(key));
  }

  async hoverEmojiByKey(key: string) {
    await this.t.hover(this.getEmojiByKey(key));
  }


  /* tab */
  get tabBar() {
    return this.self.find('.emoji-mart-anchors');
  }

  get tabs() {
    return this.self.find('.emoji-mart-anchor');
  }

  async selectedTabShouldBeCategory(category: string) {
    await this.t.expect(this.tabs.filter('.emoji-mart-anchor-selected').getAttribute('aria-label')).eql(category);
  }

  tabByCategory(category: string) {
    return this.tabs.withAttribute('aria-label', category);
  }

  async clickTabByCategory(category: string) {
    await this.t.click(this.tabByCategory(category));
  }

  /* search box */
  get searchBox() {
    return this.self.find('.emoji-mart-search');
  }

  get searchInputArea() {
    return this.self.find('#emoji-mart-search-1');
  }

  async searchEmoji(text: string) {
    await this.clickAndTypeText(this.searchInputArea, text, { paste: true, replace: true });
  }

  /* categories list*/
  get categories() {
    return this.self.find('.emoji-mart-category-label');
  }

  categoryHeaderByName(name: string) {
    return this.categories.withAttribute('data-name', name);
  }

  async categoryOnTopShouldBe(name: string) {
    await H.retryUntilPass(async () => {
      const searchBottomHeight = await this.searchBox.getBoundingClientRectProperty('bottom');
      const categoryTopHeight = await this.categoryHeaderByName(name).getBoundingClientRectProperty('top');
      assert.ok(searchBottomHeight == categoryTopHeight, `${searchBottomHeight} != ${categoryTopHeight}`);
    });
  }

  /* preview */
  get previewArea() {
    return this.self.find('.emoji-mart-preview');
  }

  async previewShouldBeKey(key: string) {
    const emojiRegExp = new RegExp(`.*, ${key}`);
    const emoji = this.previewArea.find('.emoji-mart-emoji');
    await this.t.expect(emoji.getAttribute('aria-label')).match(emojiRegExp);
  }

  get previewTitleLabel() {
    return this.previewArea.find('.emoji-mart-title-label');
  }

  get previewName() {
    return this.previewArea.find('.emoji-mart-preview-name');
  }

  get previewShortName() {
    return this.previewArea.find('.emoji-mart-preview-shortname');
  }
}

