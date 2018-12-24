
import { BaseWebComponent } from '../../BaseWebComponent';
import * as _ from 'lodash';

export class ViewProfile extends BaseWebComponent {
  get self() {
    this.warnFlakySelector();
    return this.getSelector('*[role="dialog"]');
  }

  get messageLink() {
    this.warnFlakySelector();
    return this.self.find('[aria-label="Go to the workstation of yourself"]');

}
  async shouldExistviewProfile(profileText:string) {
    await this.t.expect(this.self.child().nextSibling('div').child().withText(profileText).exists).ok();
  }

}

class MiniProfile extends BaseWebComponent {
  get closeButton() {
    return this.self.find('button').find('span').withText('close');
  }

  get messageButton() {
    return this.self.find('span').find('span').withText('chat_bubble');
  }

  async close() {
    await this.t.click(this.closeButton);
  }

  async message() {
    await this.t.click(this.messageButton);
  }
}

class ProfileModal {
  
}