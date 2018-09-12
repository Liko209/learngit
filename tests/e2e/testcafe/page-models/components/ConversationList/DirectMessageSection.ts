/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-08-21 16:35:03
 * Copyright © RingCentral. All rights reserved.
 */
import { BaseComponent } from '../..';

class DirectMessageSection extends BaseComponent {

  get section(): Selector {
    return this.selectComponent('ConversationListSection').withProps('title', 'Direct Messages');
  }

  get collapse(): Selector {
    return this.section.findReact('Collapse');
  }

  public shouldExpand() {
    return this.chain(async (t) => {
      await t.expect(this.collapse.clientHeight).gt(0);
    });
  }

  public shouldShowConversation(id) {
    return this.checkExisted(this.collapse.findReact('ConversationListItemCell').withProps('id', +id));
  }
}

export { DirectMessageSection };
