// Mia.Cai@ringcentral.com

import { ClientFunction } from 'testcafe';
import { BaseComponent } from '../..';
import { ReactSelector } from 'testcafe-react-selectors';

const url = [];
let conversationId = undefined;
class CloseConversation extends BaseComponent {
  get conversationListItem() {
    return ReactSelector('ConversationListItem');
  }
  get conversationListItemCell() {
    return ReactSelector('ConversationListItemViewComponent');
  }
  get conversationMoreButton() {
    return this.conversationListItem.findReact('Icon');
  }
  get closeButton() {
    return ReactSelector('MenuItem');
  }
  get dialog() {
    return ReactSelector('Dialog');
  }
  get dialogTitle() {
    return ReactSelector('DialogTitle');
  }
  get dialogContent() {
    return ReactSelector('DialogContentText');
  }
  get dialogButton() {
    return ReactSelector('DialogActions').findReact('JuiButton');
  }
  get dialogCheckboxLabel() {
    return ReactSelector('DialogContent').findReact('CheckboxWithLabel');
  }
  get dialogCheckbox() {
    return this.dialogCheckboxLabel.findReact('Checkbox');
  }
  async getCurrentURL() {
    const getLocation = ClientFunction(() => window.location.href);
    const url = await getLocation();
    return url;
  }
  expectSameURL(): this {
    return this.chain(async (t: TestController) => {
      await t
        .expect(url[0])
        .eql(url[1], `Current url should be the same: \n${url[0]} \n${url[1]}`);
    });
  }
  pushURL(): this {
    return this.chain(async () => {
      url.push(await this.getCurrentURL());
    });
  }
  refreshPage(): this {
    return this.chain(async (t: TestController) => {
      const current_url = await this.getCurrentURL();
      await t.navigateTo(current_url);
    });
  }
  getConversationId(): this {
    return this.chain(async (t: TestController) => {
      const current_url = await this.getCurrentURL();
      const str = current_url.toString().split('messages/');
      conversationId = str[1];
    });
  }
  expectNoClosedConversation() {
    return this.chain(async (t: TestController) => {
      const ele = this.conversationListItemCell.withProps(
        'id',
        +conversationId,
      );
      await t
        .expect(ele.exists)
        .notOk(`No conversation id: ${conversationId}`, { timeout: 30000 });
    });
  }
  clickOneConversation(index: number) {
    return this.chain(async (t: TestController) => {
      await t
        .expect(this.conversationListItem.nth(index).exists)
        .ok('Check exist one conversation', { timeout: 60000 })
        .click(this.conversationListItem.nth(index));
    });
  }
  clickConversationMoreButton(index: number): this {
    return this.chain(async (t: TestController) => {
      await t.click(this.conversationMoreButton.nth(index));
    });
  }
  clickCloseButton() {
    return this.chain(async (t: TestController) => {
      await t.click(this.closeButton.withProps('children', 'Close')).wait(1000);
    });
  }
  clickConversationById(id: number): this {
    return this.chain(async (t, h) => {
      await h.log(id.toString());
      const ele = this.conversationListItemCell.withProps('id', +id);
      await t
        .expect(ele.exists)
        .ok(`Exist conversation id: ${id}`, { timeout: 30000 })
        .click(ele);
    });
  }
  clickMoreButtonById(id: number): this {
    const ele = this.conversationListItemCell
      .withProps('id', +id)
      .findReact('Icon');
    return this.chain(async (t: TestController) => {
      await t
        .expect(ele.exists)
        .ok('Exist more button', { timeout: 60000 })
        .click(ele);
    });
  }
  expectCloseButton(): this {
    return this.chain(async (t: TestController) => {
      await t
        .expect(this.closeButton.withProps('children', 'Close').exists)
        .ok('Exist close button', { timeout: 60000 });
    });
  }
  expect2BlankPage(): this {
    return this.chain(async (t, h) => {
      const getLocation = ClientFunction(() => window.location.href);
      const open_url = await getLocation();
      const str = open_url.toString().split('messages');
      await h.log(`url doesn't contains group id: ${str[1]}`);
      await t
        .expect(str.length)
        .eql(2)
        .expect(str[1])
        .eql('');
    });
  }
  expectDialog(
    title: string,
    content: string,
    checkboxLabel: string,
    button: string,
  ): this {
    return this.chain(async (t: TestController) => {
      await t
        .expect(this.dialog.exists)
        .ok('Check exist dialog', { timeout: 60000 })
        .expect(this.dialogTitle.withProps('children', title).exists)
        .ok(`Dialog title: ${title}`)
        .expect(this.dialogContent.withProps('children', content).exists)
        .ok(`Dialog content: ${content}`)
        .expect(this.dialogCheckbox.exists)
        .ok('Exist checkbox')
        .expect(
          this.dialogCheckboxLabel.withProps('label', checkboxLabel).exists,
        )
        .ok(`CheckboxLabel: ${checkboxLabel}`)
        // todo exists one bug fiji-1005
        .expect(this.dialogButton.withProps('children', button).exists)
        .ok(`Button：${button}`);
    });
  }
  expectNoCloseButton(): this {
    return this.chain(async (t: TestController) => {
      await t
        .expect(this.closeButton.exists)
        .notOk("Check doesn't exist close button", { timeout: 60000 });
    });
  }
  expectNoDialog(): this {
    return this.chain(async (t: TestController) => {
      await t
        .expect(this.dialog.exists)
        .notOk("Check doesn't exist dialog", { timeout: 60000 });
    });
  }
  expectNoDialogTitle(title: string): this {
    return this.chain(async (t: TestController) => {
      await t
        .expect(this.dialogTitle.withProps('children',title).exists)
        .notOk("Check doesn't exist dialog", { timeout: 60000 });
    });
  }
  clickDialogCloseButton(): this {
    return this.chain(async (t: TestController) => {
      await t.click(this.dialogButton).wait(1000);
    });
  }
  clickDialogCheckbox(): this {
    return this.chain(async (t: TestController) => {
      await t.click(this.dialogCheckbox);
    });
  }
}

export { CloseConversation };
