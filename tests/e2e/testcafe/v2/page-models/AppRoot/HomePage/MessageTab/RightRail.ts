import * as assert from 'assert';
import { H } from '../../../../helpers';
import { BaseWebComponent } from "../../../BaseWebComponent";


export class RightRail extends BaseWebComponent {
  get self() {
    return this.getSelectorByAutomationId('rightRail');
  }

  get expandStatusButton() {
    this.warnFlakySelector();
    return this.getSelectorByIcon('chevron_right').parent('button[aria-label="Hide details"]');
  }

  get foldStatusButton() {
    this.warnFlakySelector();
    return this.getSelectorByIcon('chevron_left').parent('button[aria-label="Show details"]');
  }

  async expand() {
    await this.t.click(this.foldStatusButton);
  }

  async fold() {
    await this.t.click(this.expandStatusButton);
  }

  get tabList() {
    return this.self.find('[role="tablist"]')
  }

  get listSubTitle() {
    return this.getSelectorByAutomationId('rightRail-list-subtitle');
  }

  nthListItem(automationId: string, n: number) {
    return this.getSelectorByAutomationId(automationId).nth(n);
  }

  getEntry(automationId: string) {
    return this.getComponent(TabEntry, this.getSelectorByAutomationId(automationId));
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
    return this.getSelectorByAutomationId('right-shelf-more')
  }

  async openMore() {
    await this.t.click(this.moreButton);
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
    return this.getSelectorByAutomationId('rightRail-list-subtitle', this.self).withText(reg);
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


  async nthItemTitleShouldBe(n: number, title: string) {
    await this.t.expect(this.titles.nth(n).withText(title).exists).ok(
      `n: ${n} , title: ${title}`
    );
  }

  async shouldHasTitle(title: string) {
    await this.t.expect(this.titles.withText(title).exists).ok(title);
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
}

class ImageAndFileItem extends BaseWebComponent {
  get name() {
    return this.getSelectorByAutomationId('file-name', this.self);
  }

  async nameShouldBe(name: string) {
    await this.t.expect(this.name.withText(name).exists).ok();
  }

  get secondaryText() {
    return this.getSelectorByAutomationId('list-item-secondary-text', this.self);
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
    return this.getSelectorByAutomationId('list-item-secondary-text', this.self);
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
