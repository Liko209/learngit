import { BaseWebComponent } from "../../BaseWebComponent";
import { ClientFunction } from "testcafe";
import * as assert from 'assert';
import { H } from "../../../helpers";

export class FileAndImagePreviewer extends BaseWebComponent {
  get self() {
    return this.getSelectorByAutomationId('Viewer');
  }

  async shouldBeFullScreen() {
    await H.retryUntilPass(async () => {
      const width = await this.self.getBoundingClientRectProperty('width');
      const height = await this.self.getBoundingClientRectProperty('height');
      const windowSize = await ClientFunction(() => {
        return {
          width: window.innerWidth || document.body.clientWidth,
          height: window.innerHeight || document.body.clientHeight
        }
      })();
      assert.strictEqual(width, windowSize.width, 'the viewer width is not full screen');
      assert.strictEqual(height, windowSize.height, 'the viewer height is not full screen');
    });
  }

  get avatar() {
    return this.getSelectorByAutomationId('previewerSenderAvatar');
  }

  get sender() {
    return this.getSelectorByAutomationId('previewerSenderInfo');
  }

  get senderName() {
    return this.sender.find('h3');
  }

  get sendTime() {
    return this.sender.find('h4');
  }

  get title() {
    return this.getSelectorByAutomationId('previewerTitle');
  }

  get fileName() {
    return this.title.find('span').nth(0);
  }

  get positionIndex() {
    return this.title.find('span').nth(1);
  }

  get PreviewerDiv() {
    return this.getSelectorByAutomationId('previewerCanvas')
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
