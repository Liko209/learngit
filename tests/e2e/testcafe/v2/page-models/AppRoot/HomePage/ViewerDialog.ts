/*
 * @Author: Potar.He 
 * @Date: 2019-06-10 18:59:44 
 * @Last Modified by: Potar.He
 * @Last Modified time: 2019-08-30 13:55:00
 */
import { BaseWebComponent } from "../../BaseWebComponent";
import { ClientFunction, t } from "testcafe";
import { H } from "../../../helpers";

import * as assert from 'assert';

export class ViewerDialog extends BaseWebComponent {
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

  get fileName() {
    return this.getSelectorByAutomationId("viewerFileName");
  }

  get goToPageInput() {
    return this.self.find('input#outlined-number');
  }

  get positionIndex() {
    return this.getSelectorByAutomationId('viewerPageCount');
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

  get pagesScrollDiv() {
    return this.getSelector('.ViewerDocument');
  }

  async scrollToY(y: number) {
    const scrollDivElement = this.pagesScrollDiv;
    await ClientFunction((_y) => {
      scrollDivElement().scrollTop = _y;
    },
      { dependencies: { scrollDivElement } })(y);
  }

  async scrollToMiddle() {
    const scrollHeight = await this.pagesScrollDiv.scrollHeight;
    const clientHeight = await this.pagesScrollDiv.clientHeight;
    const middleHeight = (scrollHeight - clientHeight) / 2;
    await this.scrollToY(middleHeight);
  }

  async scrollToBottom() {
    const scrollHeight = await this.pagesScrollDiv.scrollHeight;
    await this.scrollToY(scrollHeight);
  }

  get contentDiv() {
    return this.getSelector('.ViewerDocumentContent');
  }

  get viewerPages() {
    return this.getSelector('.ViewerPage', this.self);
  }

  get pageContentWraps() {
    return this.getSelector('.ViewerPageContentWrap', this.self);
  }

  get thumbnails() {
    return this.getSelector('.ViewerThumbnail', this.self);
  }

  get thumbnailNumber() {
    return this.getSelectorByAutomationId('viewerThumbnailNumber');
  }

  get zoomScale() {
    return this.getSelectorByAutomationId('zoomGroupPercent')
  }

  get zoomOutIcon() {
    return this.getSelectorByIcon('zoom_out', this.self);
  }

  get zoomOutButton() {
    return this.getSelectorByAutomationId('ViewerZoomOutButton');
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
    return this.getSelectorByAutomationId('ViewerZoomInButton');
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

  get viewerResetButton() {
    return this.getSelectorByAutomationId('ViewerResetButton');
  }

  async viewerResetButtonShouldBeDisabled() {
    await this.t.expect(this.viewerResetButton.hasAttribute('disabled')).ok()
  }

  async viewerResetButtonShouldBeEnabled() {
    await this.t.expect(this.viewerResetButton.hasAttribute('disabled')).notOk()
  }

  async clickResetButton() {
    await this.t
      .expect(this.viewerResetButton.hasAttribute('disabled')).notOk()
      .click(this.viewerResetButton);
  }

  get fileActionMoreButton() {
    return this.getSelectorByAutomationId('fileActionMore');
  }

  async clickFileActionMoreMenu() {
    await this.t.click(this.fileActionMoreButton);
  }

}

