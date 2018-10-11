/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-08-21 16:35:03
 * Copyright © RingCentral. All rights reserved.
 */
import { BaseComponent } from '../..';
import { Selector } from 'testcafe';

class DirectMessageSection extends BaseComponent {
  get section(): Selector {
    return Selector('.conversation-list-section[data-name="Direct Messages"]');
  }

  public expectExist() {
    return this.chain(async (t: TestController) => {
      await t
        .expect(this.section.count)
        .eql(1, 'expect dom node exists', { timeout: 50000 });
    });
  }

  get collapse(): Selector {
    return this.section.find('.conversation-list-section-collapse');
  }

  public shouldExpand() {
    return this.chain(async (t: TestController) => {
      await t.expect(this.collapse.clientHeight).gt(0);
    });
  }

  public shouldShowConversation(id) {
    return this.checkExisted(this.collapse.find(`li[data-group-id='${id}']`));
  }

  public shouldNotShowConversation(id) {
    return this.chain(async (t: TestController) => {
      await t
        .expect(this.collapse.find(`li[data-group-id='${id}']`).exists)
        .notOk();
    });
  }
}

export { DirectMessageSection };
