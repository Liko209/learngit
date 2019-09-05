import * as assert from 'assert';
import { H } from '../../../../helpers';
import { BaseWebComponent } from '../../../BaseWebComponent';

export class RightRail extends BaseWebComponent {
  get self() {
    return this.getSelectorByAutomationId('rightRail');
  }

  get expandStatusButton() {
    return this.getSelectorByAutomationId('right_rail_trigger_button');
  }

  get expandStatusButtonByClass() {
    this.warnFlakySelector();
    return this.getSelector('.double_chevron_right');
  }

  get foldStatusButton() {
    return this.getSelectorByAutomationId('right_rail_trigger_button');
  }

  get title() {
    this.warnFlakySelector();
    return this.self
      .find('#right-rail-header')
      .child()
      .nth(0);
  }

  async shouldBeFolded() {
    await this.t.expect(this.self.clientWidth).eql(0);
  }

  async shouldBeExpanded() {
    await this.t.expect(this.self.clientWidth).gt(0);
  }

  get foldStatusButtonByClass() {
    this.warnFlakySelector();
    return this.getSelector('.double_chevron_left');
  }

  async clickFoldStatusButton() {
    await this.t.click(this.foldStatusButtonByClass);
  }

  async hoverFoldStatusButton() {
    await this.t.hover(this.foldStatusButtonByClass);
  }

  async clickExpandStatusButton() {
    await this.t.click(this.expandStatusButtonByClass);
  }

  async hoverExpandStatusButton() {
    await this.t.hover(this.expandStatusButtonByClass);
  }

  async expand() {
    await this.t.click(this.foldStatusButton);
  }

  async fold() {
    await this.t.click(this.expandStatusButton);
  }

  get tabList() {
    return this.self.find('[role="tablist"]');
  }

  get displayedTabButtons() {
    return this.tabList.find('button[role="tab"]');
  }

  get listSubTitle() {
    return this.getSelectorByAutomationId('rightRail-list-subtitle');
  }

  nthListItem(automationId: string, n: number) {
    return this.getSelectorByAutomationId(automationId).nth(n);
  }

  getEntry(automationId: string) {
    return this.getComponent(
      TabEntry,
      this.getSelectorByAutomationId(automationId),
    );
  }

  get pinnedEntry() {
    return this.getEntry('right-shelf-pinned');
  }

  get filesEntry() {
    return this.getEntry('right-shelf-files');
  }

  get imagesEntry() {
    return this.getEntry('right-shelf-images');
  }

  get tasksEntry() {
    return this.getEntry('right-shelf-tasks');
  }

  get linksEntry() {
    return this.getEntry('right-shelf-links');
  }

  get notesEntry() {
    return this.getEntry('right-shelf-notes');
  }

  get eventsEntry() {
    return this.getEntry('right-shelf-events');
  }

  get integrationsEntry() {
    return this.getEntry('right-shelf-integrations');
  }

  get moreButton() {
    return this.getSelectorByAutomationId('right-shelf-more');
  }

  get resizeHandle() {
    return this.getSelector('.resize-handle');
  }

  get expandStatusButtonDisplayed() {
    return this.expandStatusButtonByClass.exists;
  }

  async clickMoreButton() {
    if (!(await this.expandStatusButtonDisplayed)) {
      await this.clickFoldStatusButton();
    }
    await this.t.click(this.moreButton);
  }

  async hoverMoreButton() {
    if (!(await this.expandStatusButtonDisplayed)) {
      await this.clickFoldStatusButton();
    }
    await this.t.hover(this.moreButton);
  }

  async openMore() {
    await this.t.click(this.moreButton);
  }

  get moreTabsMenu() {
    return this.getSelector('ul[role="menu"]');
  }

  get moreTabsMenuEntries() {
    return this.moreTabsMenu.find('li[role="menuitem"]');
  }

  get imagesTab() {
    return this.getComponent(ImagesTab);
  }

  get filesTab() {
    return this.getComponent(FilesTab);
  }

  get eventsTab() {
    return this.getComponent(EventsTab);
  }

  get tasksTab() {
    return this.getComponent(TasksTab);
  }

  get linksTab() {
    return this.getComponent(LinksTab);
  }

  get notesTab() {
    return this.getComponent(NotesTab);
  }

  get pinnedTab() {
    return this.getComponent(PinnedTab);
  }

  get memberListSection() {
    return this.getComponent(RightShelfMemberList);
  }

  async resize(direction: 'left' | 'right', offset: number) {
    await this.t.drag(this.resizeHandle, offset * (direction === 'right' ? 1 : -1), 0);
  }
}

class TabEntry extends BaseWebComponent {
  async enter() {
    return this.t.click(this.self);
  }

  get selected() {
    return this.self.getAttribute('aria-selected');
  }

  async shouldBeOpened() {
    await this.t.expect(this.selected).eql('true');
  }
}

class BaseTab extends BaseWebComponent {
  public subTitle: Selector;
  public items: Selector;

  // this is a temp. selector
  get self() {
    return this.getSelectorByAutomationId('rightRail');
  }

  getSubTitle(name: string) {
    const reg = new RegExp(`^${name}`);
    return this.getSelectorByAutomationId(
      'rightRail-list-subtitle',
      this.self,
    ).withText(reg);
  }

  async countOnSubTitleShouldBe(n: number) {
    const reg = new RegExp(`\(${n}\)`);
    await H.retryUntilPass(async () => {
      const subTitleText = await this.subTitle.textContent;
      assert.ok(reg.test(subTitleText), `${subTitleText} not match (${n})`);
    }, 10);
  }

  async waitUntilItemsListExist(timeout = 10e3) {
    await this.t.expect(this.items.exists).ok({ timeout });
  }

  async countInListShouldBe(n: number) {
    await this.t.expect(this.items.count).eql(n);
  }

  get titles() {
    return this.items.find('.list-item-primary');
  }

  get secondaryTexts() {
    return this.items.find('.list-item-secondary');
  }

  get eventIcon() {
    return this.getSelectorByIcon('event', this.items);
  }

  async nthItemTitleShouldBe(n: number, title: string) {
    await this.t
      .expect(this.titles.nth(n).withText(title).exists)
      .ok(`n: ${n} , title: ${title}`);
  }

  async shouldHasTitle(title: string) {
    await this.t.expect(this.titles.withText(title).exists).ok(title);
  }

  async shouldHasEventTime(text: string) {
    await this.t.expect(this.secondaryTexts.withText(text).exists).ok(text);
  }

  async shouldHasEventIcon() {
    await this.t.expect(this.eventIcon.exists).ok();
  }

  async shouldHasNoTitle(title: string) {
    await this.t.expect(this.titles.withText(title).exists).notOk(title);
  }
}

class FilesTab extends BaseTab {
  get subTitle() {
    return this.getSubTitle('Files');
  }

  get items() {
    return this.getSelectorByAutomationId('rightRail-file-item');
  }

  nthItem(n: number) {
    return this.getComponent(ImageAndFileItem, this.items.nth(n));
  }
}
class ImagesTab extends BaseTab {
  get subTitle() {
    return this.getSubTitle('Images');
  }

  get items() {
    return this.getSelectorByAutomationId('rightRail-image-item');
  }

  nthItem(n: number) {
    return this.getComponent(ImageAndFileItem, this.items.nth(n));
  }
}

class EventsTab extends BaseTab {
  get subTitle() {
    return this.getSubTitle('Events');
  }

  get items() {
    return this.getSelectorByAutomationId('rightRail-event-item');
  }
}

class NotesTab extends BaseTab {
  get subTitle() {
    return this.getSubTitle('Notes');
  }

  get items() {
    return this.getSelectorByAutomationId('rightRail-note-item');
  }

  get secondaryText() {
    return this.getSelectorByAutomationId(
      'list-item-secondary-text',
      this.self,
    );
  }
}

class ImageAndFileItem extends BaseWebComponent {
  get imageThumbnail() {
    return this.getSelectorByAutomationId('thumbnail', this.self);
  }

  get fileThumbnail() {
    return this.getSelectorByAutomationId('iconThumbnail', this.self);
  }

  get docIcon() {
    return this.getSelectorByIcon('doc', this.self);
  }

  get name() {
    return this.getSelectorByAutomationId('file-name', this.self);
  }

  async nameShouldBe(name: string) {
    await this.t.expect(this.name.withText(name).exists).ok();
  }

  get more() {
    return this.getSelectorByAutomationId('fileActionMore', this.self);
  }

  async clickMore() {
    await this.t.click(this.more);
  }

  get secondaryText() {
    return this.getSelectorByAutomationId(
      'list-item-secondary-text',
      this.self,
    );
  }

  get creator() {
    return this.secondaryText.find('span').nth(0);
  }

  get time() {
    return this.secondaryText.find('span').nth(1);
  }

  get downloadIcon() {
    return this.getSelectorByIcon('download', this.self);
  }

  get previewIcon() {
    return this.getSelectorByIcon('image_preview', this.self);
  }
}

class LinksTab extends BaseTab {
  get subTitle() {
    return this.getSubTitle('Links');
  }

  get items() {
    return this.getSelectorByAutomationId('rightRail-link-item');
  }

  get titles() {
    return this.items.find('.list-item-primary');
  }

  get secondaryTexts() {
    return this.getSelectorByAutomationId(
      'list-item-secondary-text',
      this.self,
    );
  }
}

class TasksTab extends BaseTab {
  get subTitle() {
    return this.getSubTitle('Tasks');
  }

  get items() {
    return this.getSelectorByAutomationId('rightRail-task-item');
  }
}

class PinnedTab extends BaseTab {
  get subTitle() {
    return this.getSubTitle('Pinned');
  }

  get items() {
    return this.getSelectorByAutomationId('pinned-section');
  }

  nthItem(n: number) {
    return this.getComponent(PinnedItem, this.items.nth(n));
  }

  itemByPostId(postId: string) {
    return this.getComponent(
      PinnedItem,
      this.items.filter(`[data-postid="${postId}"]`),
    );
  }

  async shouldContainPostItem(postId: string) {
    await this.t
      .expect(this.items.withAttribute('data-postid', postId).exists)
      .ok();
  }
}

class PinnedItem extends BaseWebComponent {
  get postId() {
    return this.self.getAttribute('data-postid');
  }
  get creator() {
    return this.getSelectorByAutomationId('pinned-creator', this.self);
  }

  get createTime() {
    return this.getSelectorByAutomationId('pinned-createTime', this.self);
  }

  get postText() {
    return this.getSelectorByAutomationId('pinned-text', this.self);
  }

  get attachmentIcons() {
    return this.getSelectorByAutomationId('pinned-item-icon', this.self);
  }

  get nonFileOrImageAttachmentsTexts() {
    return this.getSelectorByAutomationId('pinned-item-text', this.self);
  }

  get fileOrImageFileNames() {
    return this.getSelectorByAutomationId('file-name', this.self);
  }

  get moreAttachmentsInfo() {
    return; // TODO
  }

  async shouldBePostId(postId: string) {
    await this.t.expect(this.postId).eql(postId);
  }

  async shouldBeCreator(name: string) {
    await this.t.expect(this.creator.withExactText(name).exists).ok();
  }

  async postTextShouldBe(text: string | RegExp) {
    if (typeof text == 'string') {
      await this.t.expect(this.postText.withText(text).exists).ok();
    } else {
      await this.t.expect(this.postText.textContent).match(text);
    }
  }

  async shouldHasFileOrImage(fileName: string) {
    await this.t
      .expect(this.fileOrImageFileNames.withText(fileName).exists)
      .ok();
  }

  async shouldHasAttachmentsText(text: string) {
    await this.t
      .expect(this.nonFileOrImageAttachmentsTexts.withText(text).exists)
      .ok();
  }
}

class RightShelfMemberList extends BaseWebComponent {
  get self() {
    return this.getSelectorByAutomationId('rightRail');
  }

  get header() {
    return this.getSelectorByAutomationId('rightShelfMemberListHeader');
  }

  get showAllLink() {
    return this.getSelectorByAutomationId('rightShelfMemberListHeader').find('span[data-test-automation-id="rightShelfMemberListHeaderShowAllLink"]')
  }

  get addMemberButton() {
    return this.getSelectorByAutomationId('rightShelfMemberListHeaderAddButton')
  }

  get body() {
    return this.getSelectorByAutomationId('rightShelfMemberListBody');
  }

  get members() {
    return this.getSelectorByAutomationId('rightShelfMemberListMembers')
  }

  get guests() {
    return this.getSelectorByAutomationId('rightShelfMemberListGuests')
  }

  get avatars() {
    return this.getSelectorByAutomationId('rightShelfMemberListAvatar');
  }

  getAvatarById(id: number) {
    return this.avatars.filter(`[uid='${id}']`)
  }

  /** actions */
  async clickAddMemberButton() {
    await this.t.click(this.addMemberButton);
  }
}
