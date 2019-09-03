/*
 * @Author: doyle.wu
 * @Date: 2019-01-11 10:11:03
 */
import { Page } from "./page";
import * as bluebird from "bluebird";
import { PptrUtils } from '../utils';

class ConversationPage extends Page {
  private progressbar: string =
    'div[data-test-automation-id="jui-stream-wrapper"] div[role="progressbar"]';

  private card: string =
    'div[data-test-automation-id="virtualized-list"] div div[data-name="conversation-card"]';

  private panel = 'div[data-test-automation-id="virtualized-list"]';

  async swichConversationById(id: string, scroll: boolean = true) {
    let conversation = `li[data-group-id="${id}"]`;

    let page = await this.page();

    await PptrUtils.click(page, conversation);

    await PptrUtils.disappearForSelector(page, this.progressbar);

    await PptrUtils.waitForSelector(page, this.card);

    if (scroll) {
      await PptrUtils.scrollBy(page, this.panel, 0, -1000);
      await PptrUtils.scrollBy(page, this.panel, 0, -1000);
    }

    await bluebird.delay(200);
  }

  async switchDetailTab() {
    let page = await this.page();

    await PptrUtils.click(page, 'button[data-test-automation-id="right-shelf-files"]');
    await bluebird.delay(200);

    await PptrUtils.click(page, 'button[data-test-automation-id="right-shelf-images"]');
    await bluebird.delay(200);
  }

  async lookupTeamMember() {
    let page = await this.page();

    await PptrUtils.click(page, '*[data-test-automation-id="conversation-page-header"] button[aria-label="More"]');

    await PptrUtils.click(page, 'li[data-test-automation-id="profileEntry"]');


    await PptrUtils.waitForSelector(page, 'div[data-test-automation-id="profileDialogContent"] div[data-test-automation-id="virtualized-list"] li');

    const close = 'div[data-test-automation-id="profileDialogTitle"] button[aria-label="Close"]';
    await PptrUtils.click(page, close, { check: true });

    await bluebird.delay(200);
  }

  async clickDoc() {
    let page = await this.page();
    await PptrUtils.click(page, 'div[data-test-automation-id="fileCard"]');
    await PptrUtils.waitForSelector(page, 'div[data-test-automation-id="Viewer"] div[data-page-index="0"] img');
    await bluebird.delay(1000);
  }

  async closeDocView() {
    let page = await this.page();
    await PptrUtils.click(page, 'div[data-test-automation-id="viewerActions"] button[aria-label="Close"]', { check: true });

    await bluebird.delay(1000);
  }

  async clickImage() {
    let page = await this.page();
    await PptrUtils.click(page, 'div[data-test-automation-id="imageCard"]');
    await PptrUtils.waitForSelector(page, 'div[data-test-automation-id="Viewer"] img[data-test-automation-id="previewerCanvas"]');
    await bluebird.delay(1000);
  }

  async closeImageView() {
    let page = await this.page();
    await PptrUtils.click(page, 'div[data-test-automation-id="viewerActions"] button[aria-label="Close"]', { check: true });

    await bluebird.delay(1000);
  }

  async openShareImageDialog() {
    let page = await this.page();
    let postId = await PptrUtils.attr(page, 'div[data-name="conversation-card"]', 'data-id');
    await PptrUtils.hover(page, `div[data-id="${postId}"] div[data-test-automation-id="imageCard"]`);
    await PptrUtils.click(page, `div[data-id="${postId}"] button[data-test-automation-id="fileActionMore"]`);
    await PptrUtils.click(page, 'li[data-test-automation-id="fileShareItem"]');
    await PptrUtils.waitForSelector(page, 'div[data-test-automation-id="groupSearchInput"] input');
    await bluebird.delay(1000);
  }

  async searchForShare(keyword: string) {
    let page = await this.page();
    await PptrUtils.type(page, 'div[data-test-automation-id="groupSearchInput"] input', keyword);
    await bluebird.delay(1000);
    await PptrUtils.click(page, 'span[data-test-automation-id="search-input-clear"]');
  }

  async closeShareImageDialog() {
    let page = await this.page();
    await PptrUtils.click(page, 'div[data-test-automation-id="groupSearch"] button[data-test-automation-id="groupSearchCloseButton"]', { check: true });
    await bluebird.delay(1000);
  }
}

export { ConversationPage };
