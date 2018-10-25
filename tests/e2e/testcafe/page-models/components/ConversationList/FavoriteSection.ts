/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-08-21 16:35:03
 * Copyright © RingCentral. All rights reserved.
 */
import { ConversationSection } from './ConversationSection';

export class FavoriteSection extends ConversationSection {
  public sectionName = 'Favorites';

  get listItem(): Selector {
    return this.section.find('.conversation-list-item');
  }

  dragListItem(from: number, to: number) {
    return this.chain(async (t: TestController) => {
      await this.listItem();

      const draggedItem = this.listItem.nth(from);
      const targetItem = this.listItem.nth(to);

      const draggedComponentId = await draggedItem.getAttribute(
        'data-group-id',
      );
      await t.dragToElement(draggedItem, targetItem);
      const targetComponentId = await targetItem.getAttribute('data-group-id');
      await t
        .expect(draggedComponentId)
        .eql(targetComponentId, `should drag ${from} item to ${to} position`);
    });
  }

  checkHasEnoughFavoriteConversations() {
    return this.chain(async (t: TestController) => {
      await t
        .expect(this.listItem.count)
        .gt(
          3,
          "The account don't have enough Favorites conversations for this test case.",
        );
    });
  }
}
