import { BaseWebComponent } from "../../BaseWebComponent";


export class FileAndImagePreviewer extends BaseWebComponent {
  get self() {
    return this.getSelector('[role="document"]');
  }

  get avatar() {
    return // todo: automationId
  }

  get author() {
    return this.self.find('h3'); // todo: automationId
  }

  get createTime() {
    return this.self.find('h4'); // todo: automationId
  }

  get title() {
    return this.self.find('h4'); // todo: automationId 
  }

  get imageName() {
    return this.title.find('span').nth(0); // todo: automationId 
  }

  get position() {
    return this.title.find('span').nth(1); // todo: automationId 
  }

  get PreviewerDiv() {
    return // todo: automationId 
  }

  get downloadIcon() {
    return this.getSelectorByIcon('download', this.self);
  }

  get closeButton() {
    return this.closeIcon.parent('button');
  }

  get closeIcon() {
    return this.getSelectorByIcon('close', this.self);
  }

  async clickCloseButton() {
    await this.t.click(this.closeButton);
  }

  get perviousIcon() {
    return this.getSelectorByIcon('pervious', this.self);
  }

  get perviousButton() {
    return this.perviousIcon.parent('button');
  }

  get forwardIcon() {
    return this.getSelectorByIcon('forward', this.self);
  }

  get forwardButton() {
    return this.forwardIcon.parent('button');
  }

  async clickPerviousButton() {
    await this.t
      .expect(this.perviousButton.hasAttribute('disabled')).notOk()
      .click(this.perviousButton);
  }

  async clickForwardButton() {
    await this.t
      .expect(this.forwardButton.hasAttribute('disabled')).notOk()
      .click(this.forwardButton);
  }

  get zoomOutIcon() {
    return this.getSelectorByIcon('zoom_out', this.self);
  }

  get zoomOutButton() {
    return this.zoomOutIcon.parent('button');
  }

  async clickZoomOutButton() {
    await this.t
      .expect(this.zoomOutButton.hasAttribute('disabled')).notOk()
      .click(this.zoomOutButton);
  }

  get zoomInIcon() {
    return this.getSelectorByIcon('zoom_out', this.self);
  }

  get zoomInButton() {
    return this.zoomInIcon.parent('button');
  }

  async clickZoomInButton() {
    await this.t
      .expect(this.zoomInButton.hasAttribute('disabled')).notOk()
      .click(this.zoomInButton);
  }
}