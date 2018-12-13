
import { BaseWebComponent } from '../../BaseWebComponent';
import * as _ from 'lodash';

export class ViewProfile extends BaseWebComponent {
  get self() {
    this.warnFlakySelector();
    return this.getSelector('*[role="dialog"]');
  }
  async shouldExistviewProfile(profileText:string) {
    await this.t.expect(this.self.child().nextSibling('div').child().withText(profileText).exists).ok();
  }

}
