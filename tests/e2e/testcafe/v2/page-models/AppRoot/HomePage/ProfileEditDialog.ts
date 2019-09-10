import { BaseWebComponent } from '../../BaseWebComponent';
import * as faker from 'faker/locale/en';



export class ProfileEditDialog extends BaseWebComponent {
  get self() {
    return this.getSelectorByAutomationId('EditProfile');
  }

  get avatarEditDiv() {
    return this.getSelectorByAutomationIdUnderSelf('profileEditAvatar');
  }

  async clickAvatarEditDiv() {
    await this.t.click(this.avatarEditDiv);
  }

  get avatarEditIcon() {
    return this.getSelectorByIcon('edit', this.self);
  }

  async clickAvatarEditIcon() {
    await this.t.click(this.avatarEditIcon);
  }

  get firstName() {
    return this.getSelectorByAutomationId('editProfileFirstNameItem');
  }
  get lastName() {
    return this.getSelectorByAutomationId('editProfileLastNameItem');
  }
  get title() {
    return this.getSelectorByAutomationId('editProfileTitleItem');
  }
  get location() {
    return this.getSelectorByAutomationId('editProfileLocationItem');
  }
  get webpage() {
    return this.getSelectorByAutomationId('editProfileWebpageItem');
  }

  // for testcafe upload enter point
  get uploadInputEntry() {
    return this.getSelectorByAutomationIdUnderSelf('upload-file-input');
  }

  get cancelButton() {
    return this.getSelectorByAutomationId('DialogCancelButton');
  }
  get saveButton() {
    return this.getSelectorByAutomationId('DialogOKButton');
  }
  async clickSaveButton() {
    await this.t.click(this.saveButton);
  }
  async clickCancelButton() {
    await this.t.click(this.cancelButton);
  }
  get webpageInlineError() {
    return this.webpage.find('p');
  }

  async inputFirstName(web: string, options: TypeActionOptions = { replace: true }) {
    await this.clickAndTypeText(this.firstName, web, options);
  }
  async inputLastName(web: string, options: TypeActionOptions = { replace: true }) {
    await this.clickAndTypeText(this.lastName, web, options);
  }
  async inputWebpage(web: string, options: TypeActionOptions = { replace: true }) {
    await this.clickAndTypeText(this.webpage, web, options);
  }
  async inputTitle(web: string, options: TypeActionOptions = { replace: true }) {
    await this.clickAndTypeText(this.title, web, options);
  }
  async inputLocation(web: string, options: TypeActionOptions = { replace: true }) {
    await this.clickAndTypeText(this.location, web, options);
  }
  randomString(length: number) {
    return faker.random.alphaNumeric(length);
  }
  async typeRandomFirstName(length: number, options: TypeActionOptions = { replace: true }) {
    await this.inputFirstName(this.randomString(length), options);
  }
  async typeRandomLastName(length: number, options: TypeActionOptions = { replace: true }) {
    await this.inputLastName(this.randomString(length), options);
  }
  async typeRandomWebpage(length: number, options: TypeActionOptions = { replace: true }) {
    await this.inputWebpage(this.randomString(length), options);
  }
  async typeRandomTitle(length: number, options: TypeActionOptions = { replace: true }) {
    await this.inputTitle(this.randomString(length), options);
  }
  async typeRandomLocation(length: number, options: TypeActionOptions = { replace: true }) {
    await this.inputLocation(this.randomString(length), options);
  }

  /** actions */
  async uploadFile(filePath: string) {
    await this.t.setFilesToUpload(this.uploadInputEntry, filePath)
  }

  async updateFirstName(text: string, options?) {
    await this.t.typeText(this.firstName, text, options);
  }
  async updateLastName(text: string, options?) {
    await this.t.typeText(this.lastName, text, options);
  }
}
