/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-08-21 16:35:03
 * Copyright © RingCentral. All rights reserved.
 */
import { ReactSelector } from 'testcafe-react-selectors';
import { BaseComponent } from '../..';

export class FavoriteSection extends BaseComponent {
  get section(): Selector {
    return ReactSelector('ConversationListSection').withProps('title', 'Favorites');
  }

  get header(): Selector {
    return this.section.findReact('ConversationListSectionHeader');
  }

  get collapse(): Selector {
    return this.section.findReact('Collapse');
  }

  get listItem(): Selector {
    return this.section.findReact('ConversationListItem');
  }

  clickHeader() {
    return this.clickElement(this.header);
  }

  dragListItem(from: number, to: number) {
    return this.chain(async (t) => {
      await this.listItem();

      const draggedItem = this.listItem.nth(from);
      const targetItem = this.listItem.nth(to);

      const draggedComponent = await draggedItem.getReact();
      await t.dragToElement(draggedItem, targetItem);
      const targetComponent = await targetItem.getReact();
      await t.expect(draggedComponent.key).eql(targetComponent.key, `should drag ${from} item to ${to} position`);
    });
  }

  checkHasEnoughFavoriteConversations() {
    return this.chain(async (t) => {
      await t.expect(this.listItem.count).gt(3, 'The account don\'t have enough Favorites conversations for this test case.');
    });
  }

  checkExpanded() {
    return this.chain(async (t) => {
      await t.expect(this.collapse.clientHeight).gt(0);
    });
  }

  checkCollapsed() {
    return this.chain(async (t) => {
      await t.expect(this.collapse.clientHeight).eql(0);
    });
  }
}
