import { BaseWebComponent } from '../../BaseWebComponent';


export class AlertDialog extends BaseWebComponent {
  get self() {
    return this.getSelector('[role="alertdialog"]');
  }
  async shouldBePopUp() {
    await this.t.expect(this.self.exists).ok();
  }

  get message() {
    return this.self.find('.message')
  }

  async shouldBeShowMessage(text: string) {
    return this.t.expect(this.message.withExactText(text).exists).ok();
  }
}