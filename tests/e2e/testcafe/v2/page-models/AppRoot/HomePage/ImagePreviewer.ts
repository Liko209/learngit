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

  get header() {
    return this.getSelectorByAutomationId('ViewerHeader');
  }

  get avatar() {
    return this.getSelectorByAutomationId('viewerSenderAvatar');
  }

  get sender() {
    return this.getSelectorByAutomationId('viewerSenderInfo');
  }

  get senderName() {
    return this.sender.find('h3');
  }

  get sendTime() {
    return this.sender.find('h4');
  }

  get title() {
    return this.getSelectorByAutomationId('viewerTitle');
  }

  //for avatar only
  get avatarUserName() {
    return this.title.find('h2')
  }

  get fileName() {
    return this.title.find('span').nth(0);
  }

  get positionIndex() {
    return this.title.find('span').nth(1);
  }

  get imageCanvas() {
    return this.getSelectorByAutomationId('previewerCanvas')
  }

  get previewDiv() {
    this.warnFlakySelector();
    return this.imageCanvas.parent(2);
  }

  async expectImageAllIsVisible() {
    await H.retryUntilPass(async () => {
      const { left, right, top, bottom } = await this.imageCanvas.boundingClientRect;
      const headerBottom = await this.header.getBoundingClientRectProperty('bottom');
      const windowSize = await ClientFunction(() => {
        return {
          width: window.innerWidth || document.body.clientWidth,
          height: window.innerHeight || document.body.clientHeight
        }
      })();
      assert.ok(top > headerBottom && left > 0 && right < windowSize.width && bottom < windowSize.height, "image is not all  visible");
    })
  }

  get downloadIcon() {
    return this.getSelectorByIcon('download', this.self);
  }
  get moreButton() {
    return this.getSelectorByAutomationId('fileActionMore', this.self);
  }

  get downloadButton() {
    return this.downloadIcon.parent('a');
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

  get previousIcon() {
    return this.getSelectorByIcon('previous', this.self);
  }

  get previousButton() {
    return this.previousIcon.parent('button');
  }

  get forwardIcon() {
    return this.getSelectorByIcon('forward', this.self);
  }

  get forwardButton() {
    return this.forwardIcon.parent('button');
  }

  async clickPreviousButton() {
    await this.t
      .expect(this.previousButton.hasAttribute('disabled')).notOk()
      .click(this.previousButton);
  }

  async hoverPreviousButton() {
    await this.t
      .expect(this.previousButton.hasAttribute('disabled')).notOk()
      .hover(this.previousButton);
  }

  async clickForwardButton() {
    await this.t
      .expect(this.forwardButton.hasAttribute('disabled')).notOk()
      .click(this.forwardButton);
  }

  async hoverForwardButton() {
    await this.t
      .expect(this.forwardButton.hasAttribute('disabled')).notOk()
      .hover(this.forwardButton);
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
  async hoverZoomOutButton() {
    await this.t
      .expect(this.zoomOutButton.hasAttribute('disabled')).notOk()
      .hover(this.zoomOutButton);
  }

  get zoomInIcon() {
    return this.getSelectorByIcon('zoom_in', this.self);
  }

  get zoomInButton() {
    return this.zoomInIcon.parent('button');
  }

  async clickZoomInButton() {
    await this.t
      .expect(this.zoomInButton.hasAttribute('disabled')).notOk()
      .click(this.zoomInButton);
  }
  async hoverZoomInButton() {
    await this.t
      .expect(this.zoomInButton.hasAttribute('disabled')).notOk()
      .hover(this.zoomInButton);
  }

  get zoomResetIcon() {
    return this.getSelectorByIcon('reset_zoom', this.self);
  }

  get zoomResetButton() {
    return this.zoomResetIcon.parent('button');
  }

  async clickZoomResetButton() {
    await this.t
      .expect(this.zoomResetButton.hasAttribute('disabled')).notOk()
      .click(this.zoomResetButton);
  }

  async zoomResetButtonIsDisabled() {
    await this.t
      .expect(this.zoomResetButton.hasAttribute('disabled')).ok();
  }

  get zoomPercentageText() {
    return this.self.find('.zoomGroup').child('div').nth(1).textContent;
  }

  async hoverPreviewer() {
    await this.t.hover(this.imageCanvas);
  }
}

