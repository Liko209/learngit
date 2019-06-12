import * as _ from 'lodash';
import * as assert from 'assert'
import { BaseWebComponent } from '../../../BaseWebComponent';
import { h, H } from '../../../../helpers';
import { ClientFunction } from 'testcafe';


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

  getEmojiByValue(value: string) {
    return this.emojis.filter(`[aria-label$=", ${value}"]`);
  }

  async clickEmojiByValue(key: string) {
    await this.t.click(this.getEmojiByValue(key));
  }

  async hoverEmojiByValue(key: string) {
    await this.t.hover(this.getEmojiByValue(key));
  }

  /* tab */
  private indexMap = {
    'Search Results': 0, // no data-index
    'Frequently Used': 1,
    'Smileys & People': 2,
    'Animals & Nature': 3,
    'Food & Drink': 4,
    'Activity': 5,
    'Travel & Places': 6,
    'Objects': 7,
    'Symbols': 8,
    'Flags': 9,
  }

  get tabBar() {
    return this.self.find('.emoji-mart-anchors');
  }

  get tabs() {
    return this.self.find('.emoji-mart-anchor');
  }

  async selectedTabShouldBeCategory(category: string) {
    const dataIndex: number = this.indexMap[category];
    await this.t.expect(this.tabs.filter('.emoji-mart-anchor-selected').getAttribute('data-index')).eql(dataIndex.toString());
  }

  tabByCategory(category: string) {
    const dataIndex: number = this.indexMap[category];
    return this.tabs.filter(`[data-index="${dataIndex}"]`);
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

  /* preview */
  get previewArea() {
    return this.self.find('.emoji-mart-preview');
  }

  async previewShouldBeKey(key: string) {
    const emojiRegExp = new RegExp(`.*, ${key}$`);
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

  get scrollDiv() {
    return this.self.find('.emoji-mart-scroll');
  }

  /* section */
  getSection(category: string) {
    const dataIndex = this.indexMap[category];
    return this.getComponent(EmojiSection, this.self.find('section.emoji-mart-category').nth(dataIndex));
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

  /* emoji foot */
  get footSection() {
    return this.self.find('.leftContainer');
  }

  get keepOpenToggle() {
    return this.checkboxOf(this.footSection);
  }

  get keepOpenStatus() {
    return this.keepOpenToggle.checked;
  }

  private async toggle(checkbox: Selector, check: boolean) {
    const isChecked = await checkbox.checked;
    if (isChecked != check) {
      await this.t.click(checkbox);
    }
  }

  async turnOnKeepOpen() {
    await this.toggle(this.keepOpenToggle, true);
  }

  async turnOffKeepOpen() {
    await this.toggle(this.keepOpenToggle, false);
  }

  async categoryHeaderOnTopShouldBe(category: string) {
    await H.retryUntilPass(async () => {
      const searchBottomHeight = await this.searchBox.getBoundingClientRectProperty('bottom');
      const categoryTopHeight = await this.getSection(category).header.getBoundingClientRectProperty('top');
      assert.ok(searchBottomHeight == categoryTopHeight, `${searchBottomHeight} != ${categoryTopHeight}`);
    });
  }

}


class EmojiSection extends BaseWebComponent {
  get header() {
    return this.self.find('.emoji-mart-category-label');
  }
  get list() {
    return this.self.find('.emoji-mart-category-list');
  }

  /* search only */
  get noResultDiv() {
    return this.self.find('.emoji-mart-no-results')
  }

  get noResultLabel() {
    return this.noResultDiv.find('.emoji-mart-no-results-label');
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

  async hoverEmojiByNth(n: number) {
    await this.t.hover(this.emojis.nth(n));
  }

  async clickRandomEmoji() {
    const count = await this.emojis.count;
    const n = Math.floor(Math.random() * count);
    await this.clickEmojiByNth(n);
  }

  emojiItemByValue(value: string) {
    return this.getComponent(EmojiItem, this.getEmojiByValue(value));
  }

  getEmojiByValue(value: string) {
    return this.emojis.filter(`[aria-label$=", ${value}"]`);
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

export class EmojiMatchList extends BaseWebComponent {
  get self() {
    return this.getSelectorByAutomationId('ColonEmojiPanel');
  }
  get items() {
    return this.getSelector('[data-test-automation-class="match-item"]');
  }

  // value like :smile:
  itemByValue(value: string) {
    return this.getComponent(EmojiMatchItem, this.items.filter(`[data-test-automation-value="${value}]`));
  }

  itemByNth(n: number) {
    return this.getComponent(EmojiMatchItem, this.items.nth(n));
  }

}

class EmojiMatchItem extends BaseWebComponent {
  get value() {
    return this.self.getAttribute('data-test-automation-value');
  }

  get textSpan() {
    return this.self.find('[aria-label="display-text"]');
  }

  async shouldBeSelected() {
    return this.t.expect(this.self.hasClass('selected')).ok();
  }

}
