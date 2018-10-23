/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-10-19 11:50:16
 * Copyright © RingCentral. All rights reserved.
 */

import { BaseComponent } from '../..';
import { Selector } from 'testcafe';

class ConversationSection extends BaseComponent {
  public sectionName: string;
  get section(): Selector {
    return Selector(
      this.sectionName
        ? `.conversation-list-section[data-name="${this.sectionName}"]`
        : '.conversation-list-section',
    );
  }

  public expectExist() {
    return this.chain(async (t: TestController) => {
      await t
        .expect(this.section.count)
        .eql(1, 'expect dom node exists', { timeout: 500000 });
    });
  }

  get header(): Selector {
    return this.section.find('.conversation-list-section-header');
  }

  get collapse(): Selector {
    return this.section.find('.conversation-list-section-collapse').parent(2);
  }

  public shouldExpand() {
    return this.chain(async (t: TestController) => {
      await t
        .expect(this.collapse.clientHeight)
        .gt(0, 'collapse height should be more than 0', {
          timeout: 10000,
        });
    });
  }

  public shouldCollapse() {
    return this.chain(async (t: TestController) => {
      await t
        .expect(this.collapse.clientHeight)
        .eql(0, 'collapse height should be 0', {
          timeout: 10000,
        });
    });
  }

  public shouldShowConversation(id) {
    return this.checkExisted(
      this.collapse.find(`.conversation-list-item[data-group-id='${id}']`),
    );
  }

  public shouldNotShowConversation(id) {
    return this.chain(async (t: TestController) => {
      await t
        .expect(
          this.collapse.find(`.conversation-list-item[data-group-id='${id}']`)
            .exists,
        )
        .notOk();
    });
  }

  public clickItemById(id: number) {
    return this.clickElement(
      this.collapse.find(`.conversation-list-item[data-group-id="${id}"]`),
    );
  }

  public clickEachItem() {
    return this.chain(async (t: TestController) => {
      const items = this.collapse.find('.conversation-list-item');
      const count = await items.count;
      for (let i = 0; i < count; i++) {
        await t.click(items.nth(i));
      }
    });
  }

  public clickHeader() {
    return this.clickElement(this.header);
  }
}

export { ConversationSection };
