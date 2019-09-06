import { BaseWebComponent } from "../../BaseWebComponent";
import { H } from '../../../helpers';

export class MoreActionOnFile extends BaseWebComponent {

  get self() {
    return this.getSelectorByAutomationId('fileActionMore');
  }

  get shareFileMenu(){
    return this.getSelectorByAutomationId('fileShareItem');
  }

  get renameFileMenu() {
    return this.getSelectorByAutomationId('fileNameEditItem', this.fileActionMenuList);
  }

  get deleteFileMenu() {
    return this.getSelectorByAutomationId('fileDeleteItem', this.fileActionMenuList);
  }

  get viewInPostMenu() {
    return this.getSelectorByAutomationId('viewInPost', this.fileActionMenuList);
  }

  get fileActionMenuList() {
    return this.getSelectorByAutomationId('fileActionMenuList');
  }

  get renameFileDialog() {
    return this.getComponent(RenameFileDialog);
  }

  get confirmDeleteDialog() {
    return this.getComponent(ConfirmDeleteDialog);
  }

  async renameFileMenuDisabledOrNot(status: boolean) {
    await this.t.expect(this.renameFileMenu.getAttribute('data-disabled')).eql(String(status));
  }

  async clickMore() {
    await this.t.click(this.self);
  }

  async clickShareFileMenu(){
    await this.t.click(this.shareFileMenu);
  }

  async clickRenameFileMenu() {
    await this.t.click(this.renameFileMenu);
  }

  async clickDeleteFile() {
    await this.t.click(this.deleteFileMenu);
  }

  async clickViewInPost() {
    await this.t.click(this.viewInPostMenu);
  }

  async renameFileMenuAtTop(menu: string) {
    await this.t.expect(this.fileActionMenuList.nth(0).withText(menu).exists).ok();
  }
}

export class MoreActionOnViewer extends MoreActionOnFile {
  get self() {
    return this.getSelectorByAutomationId('fileActionMore', this.getSelectorByAutomationId('ViewerHeader'));
  }
}
export class RenameFileDialog extends BaseWebComponent {

  get self() {
    return this.getSelectorByAutomationId('fileNameEditDialog');
  }

  get cancelButton() {
    return this.getSelectorByAutomationId('DialogCancelButton');
  }

  get saveButton() {
    return this.getSelectorByAutomationId('DialogOKButton');
  }

  get fileNameInput() {
    return this.getSelectorByAutomationId('fileNameEditInput');
  }

  get fileNameInputValue() {
    return this.getSelectorByAutomationId('followSuffixTextFieldInputValue');
  }

  get fileNameSuffix() {
    return this.getSelectorByAutomationId('followSuffixTextFieldSuffixEl');
  }

  async clickCancelButton() {
    await this.t.click(this.cancelButton);
  }

  async clickSaveButton() {
    await this.t.click(this.saveButton);
    await this.waitForAllSpinnersToDisappear();
  }

  async updateFileName(text: string) {
    await this.clickAndTypeText(this.fileNameInput, text, { replace: true, paste: true });
  }

  async existFileNameWithSuffix(name: string, suffix: string) {
    await this.t.expect(this.fileNameInputValue.withExactText(name).exists).ok();
    await this.t.expect(this.fileNameSuffix.withExactText(H.escapePostText(suffix)).exists).ok();
  }

  async saveButtonShouldDisabled() {
    await this.t.expect(this.saveButton.hasAttribute('disabled')).ok();
  }

  async clearFileNameInput() {
    await this.t.selectTextAreaContent(this.fileNameInput).pressKey('delete');
  }

}

export class ConfirmDeleteDialog extends BaseWebComponent {
  get self() {
    return this.getSelectorByAutomationId('confirmDeleteDialog');
  }

  get cancelButton() {
    return this.getSelectorByAutomationId('DialogCancelButton');
  }

  get deleteButton() {
    return this.getSelectorByAutomationId('DialogOKButton');
  }

  get dialogTitle() {
    return this.getSelectorByAutomationId('DialogTitle');
  }

  async clickCancelButton() {
    await this.t.click(this.cancelButton);
  }

  async clickDeleteButton() {
    await this.t.click(this.deleteButton);
    await this.waitForAllSpinnersToDisappear();
  }
}
