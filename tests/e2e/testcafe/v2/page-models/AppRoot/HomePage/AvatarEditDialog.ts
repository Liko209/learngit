import * as assert from 'assert';
import { BaseWebComponent } from '../../BaseWebComponent';
import { ClientFunction } from 'testcafe';
import { H } from '../../../helpers';


export class AvatarEditDialog extends BaseWebComponent {
  get self() {
    return this.getSelectorByAutomationId('EditProfilePhoto');
  }

  get title() {
    return this.getSelectorByAutomationIdUnderSelf('DialogTitle');
  }

  get dialogContent() {
    return this.getSelectorByAutomationIdUnderSelf('DialogContent');
  }

  get uploadButton() {
    return this.getSelectorByAutomationIdUnderSelf('photoEditUploadButton');
  }

  // for testcafe upload enter point 
  get uploadInputEntry() {
    return this.getSelectorByAutomationIdUnderSelf('upload-file-input');
  }

  get imageCanvas() {
    return this.getSelectorByAutomationIdUnderSelf('PhotoEditContent');
  }

  get imageCanvasMask() {
    return this.getSelectorByAutomationId('PhotoEditMask');
  }

  get circleArea() {
    return this.getSelectorByAutomationIdUnderSelf('photoEditOperationArea');
  }

  get image() {
    return this.getSelectorByAutomationIdUnderSelf('photoEditImage');
  }

  get zoomText() {
    return this.getSelectorByAutomationIdUnderSelf('PhotoEditZoomText');
  }

  get zoomControl() {
    return this.getSelectorByAutomationIdUnderSelf('PhotoEditSlider');
  }

  get zoomValue() {
    return this.zoomControl.find('input').value
  }

  get cancelButton() {
    return this.getSelectorByAutomationIdUnderSelf('DialogCancelButton');
  }

  get doneButton() {
    return this.getSelectorByAutomationIdUnderSelf('DialogOKButton');
  }

  /** actions */
  async uploadFile(filePath: string) {
    await this.t.setFilesToUpload(this.uploadInputEntry, filePath)
  }

  async clickCancelButton() {
    await this.t.click(this.cancelButton);
  }

  async clickDoneButton() {
    await this.t.click(this.doneButton);
  }


  /** asserts */
  async expectImageCanvasBackgroundInBlack() {
    await H.retryUntilPass(async () => {
      const style = await this.imageCanvas.style;
      assert.ok(style['background-color'] == 'rgb(0, 0, 0)', 'background-color not eql specify: rgb(0, 0, 0)');
    })
  }

  // for opacity value use MT
  async expectImageCanvasMaskExists() {
    await this.t.expect(this.imageCanvasMask.exists).ok();
  }





}
