import { BaseWebComponent } from "../../../BaseWebComponent";


export class RightRail extends BaseWebComponent {

  get self() {
    return this.getSelectorByAutomationId('rightRail');
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

  getTab(text: string) {
    return this.getSelectorByAutomationId(`rightShelf-${text}`);
  }

  async clickTab(text: string) {
    await this.t.click(this.getTab(text))
  }

  get images() {
    return this.getComponent(Images)
  }
}

class TabEntry extends BaseWebComponent {
  async enter() {
    return this.t.click(this.self);
  }

  get selected() {
    return this.self.getAttribute('aria-selected');
  }

  async shouldBeOpen() {
    await this.t.expect(this.selected).eql('true');
  }


}

class Images extends BaseWebComponent {

  // need a way to get self......
  // get self() {

  // }

  get subTitle() {
    return this.getSelectorByAutomationId('rightRail-list-subtitle');
  }
  
  countOnSubTitle() {
    
  }
  get items() {
    return this.getSelectorByAutomationId('rightRail-image-item');
  }

  nthItem(n: number) {
    return this.getComponent(ImageItem, this.items.nth(n));
  }

  async shouldBeShow() {
    await this.t.expect(this.subTitle.exists).ok()
  }

}

class ImageItem extends BaseWebComponent {
  get name() {
    return this.getSelectorByAutomationId('file-name', this.self);
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
    return this.getSelectorByIcon('download',this.self);
  }

  get previewIcon() {
    return this.getSelectorByIcon('image_preview',this.self);
  }

}



