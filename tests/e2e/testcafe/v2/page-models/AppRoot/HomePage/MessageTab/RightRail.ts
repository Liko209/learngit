import { BaseWebComponent } from "../../../BaseWebComponent";


export class RightRail extends BaseWebComponent {
  get self() {
    return this.getSelectorByAutomationId('rightRail');
  }

  isShowed() {
    
  }
  show() {

  }

  hide() {

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

  get linkTab() {
    return this.getComponent(LinksTab);
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

class FilesTab extends BaseWebComponent {
  // this is a temp. selector
  get self() {
    return this.getSelectorByAutomationId('rightRail');
  }

  get subTitle() {
    return this.getSelectorByAutomationId('rightRail-list-subtitle').withText(/^Files/);
  }

  async countOnSubTitleShouldBe(n: number) {
    const reg = new RegExp(`\(${n}\)`)
    await this.t.expect(this.subTitle.textContent).match(reg);
  }

  async waitUntilFilesItemExist(timeout = 10e3) {
    await this.t.expect(this.items.exists).ok({ timeout });
  }

  get items() {
    return this.getSelectorByAutomationId('rightRail-file-item');
  }

  nthItem(n: number) {
    return this.getComponent(ImageAndFileItem, this.items.nth(n));
  }

}

class ImagesTab extends BaseWebComponent {
  // this is a temp. selector
  get self() {
    return this.getSelectorByAutomationId('rightRail');
  }

  get subTitle() {
    return this.getSelectorByAutomationId('rightRail-list-subtitle').withText(/^Images/);
  }

  async countOnSubTitleShouldBe(n: number) {
    const reg = new RegExp(`\(${n}\)`)
    await this.t.expect(this.subTitle.textContent).match(reg);
  }

  async waitUntilImagesItemExist(timeout = 10e3) {
    await this.t.expect(this.items.exists).ok({ timeout });
  }

  get items() {
    return this.getSelectorByAutomationId('rightRail-image-item');
  }

  nthItem(n: number) {
    return this.getComponent(ImageAndFileItem, this.items.nth(n));
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


class LinksTab extends BaseWebComponent {
  // this is a temp. selector
  get self() {
    return this.getSelectorByAutomationId('rightRail');
  }

  get subTitle() {
    return this.getSelectorByAutomationId('rightRail-list-subtitle').withText(/^Links/);
  }

  async countOnSubTitleShouldBe(n: number) {
    const reg = new RegExp(`\(${n}\)`)
    await this.t.expect(this.subTitle.textContent).match(reg);
  }

  async waitUntilLinksItemExist(timeout = 10e3) {
    await this.t.expect(this.items.exists).ok({ timeout });
  }

  get items() {
    return this.getSelectorByAutomationId('rightRail-link-item');
  }

  async linksCountsShouldBe(n: number) {
    await this.t.expect(this.items.count).eql(n);
  }


}





