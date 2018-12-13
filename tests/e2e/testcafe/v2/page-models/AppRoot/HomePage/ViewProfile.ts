
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
