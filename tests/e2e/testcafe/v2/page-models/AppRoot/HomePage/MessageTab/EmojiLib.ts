import * as _ from 'lodash';
import * as assert from 'assert'
import { BaseWebComponent } from '../../../BaseWebComponent';
import { h, H } from '../../../../helpers';


export class EmojiLibrary extends BaseWebComponent {
  get self() {
    return this.getSelectorByAutomationId('conversation-chatbar-emoji-menu');
  }

  get emojis() {
    return this.self.find('.emoji-mart-emoji');
  }

  nthEmojiItem(n: number) {
    return this.getComponent(EmojiItem, this.emojis.nth(n));
  }

  async clickNthEmoji(n: number) {
    await this.t.click(this.emojis.nth(n));
  }

  async clickRandomEmoji() {
    const count = await this.emojis.count;
    const n = Math.floor(Math.random() * count);
    await this.clickNthEmoji(n);
  }

  emojiItemByValue(value: string) {
    return this.getComponent(EmojiItem, this.getEmojiByValue(value));
  }

  getEmojiByValue(key: string) {
    const emojiRegExp = new RegExp(`.*, ${key}$`)
    return this.emojis.filter(`[aria-label$=", ${emojiRegExp}"]`);
  }

  async clickEmojiByValue(key: string) {
    await this.t.click(this.getEmojiByValue(key));
  }

  async hoverEmojiByValue(key: string) {
    await this.t.hover(this.getEmojiByValue(key));
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

  getSection(category: string) {
    return this.getComponent(EmojiSection, this.self.find(`.emoji-mart-category[aria-label="${category}"]`));
  }

  get searchResultSection() {
    return this.getSection('Search Results');
  }

  get frequentlyUsedSection() {
    return this.getSection('Frequently Used');
  }

  get smileysAndPeopleSection() {
    return this.getSection('Smileys & People');
  }

  get animalsAndNatureSection() {
    return this.getSection('Animals & Nature');
  }

  get foodAndDrinkSection() {
    return this.getSection('Food & Drink');
  }

  get activitySection() {
    return this.getSection('Activity');
  }

  get travelAndPlacesSection() {
    return this.getSection('Travel & Places');
  }

  get objectsSection() {
    return this.getSection('Objects');
  }

  get symbolsSection() {
    return this.getSection('Symbols');
  }

  get flagsSection() {
    return this.getSection('Flags');
  }
}


class EmojiSection extends BaseWebComponent {
  get header() {
    return this.self.find('.emoji-mart-category-label')
  }

  get emojis() {
    return this.self.find('.emoji-mart-emoji');
  }

  nthEmojiItem(n: number) {
    return this.getComponent(EmojiItem, this.emojis.nth(n));
  }

  async clickEmojiByNth(n: number) {
    await this.t.click(this.emojis.nth(n));
  }

  async clickRandomEmoji() {
    const count = await this.emojis.count;
    const n = Math.floor(Math.random() * count);
    await this.clickEmojiByNth(n);
  }

  emojiItemByValue(value: string) {
    return this.getComponent(EmojiItem, this.getEmojiByValue(value));
  }

  getEmojiByValue(key: string) {
    const emojiRegExp = new RegExp(`.*, ${key}$`)
    return this.emojis.filter(`[aria-label$=", ${emojiRegExp}"]`);
  }

  async clickEmojiByValue(key: string) {
    await this.t.click(this.getEmojiByValue(key));
  }

  async hoverEmojiByValue(key: string) {
    await this.t.hover(this.getEmojiByValue(key));
  }

}

class EmojiItem extends BaseWebComponent {
  async getValue() {
    const text = await this.self.getAttribute('aria-label');
    return text.split(', ')[1].trim();
  }
}