/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-08-21 16:35:03
 * Copyright © RingCentral. All rights reserved.
 */
import { ReactSelector } from 'testcafe-react-selectors';
import { BasePage } from '../../BasePage';

const section = ReactSelector('ConversationSection').withProps('title', 'Favorite');
const listItem = section.findReact('ConversationListItem');
const header = section.findReact('ConversationListSectionHeader');
const collapse = section.findReact('Collapse');

class FavoriteSection extends BasePage {
  section: Selector = section;
  header: Selector = header;
  collapse: Selector = collapse;
  listItem: Selector = listItem;

  clickHeader() {
    return this.click(this.header);
  }

  dragListItem(from: number, to: number) {
    return this.chain(async (t) => {
      const draggedItem = this.listItem.nth(from);
      const targetItem = this.listItem.nth(to);

      // TODO This is a hack to wait for draggedItem
      await t.click(draggedItem);

      const draggedComponent = await draggedItem.getReact();
      await t.dragToElement(draggedItem, targetItem);
      const targetComponent = await targetItem.getReact();

      await t.expect(draggedComponent.key).eql(targetComponent.key, `should drag ${from} item to ${to} position`);
    });
  }

  expectExpanded() {
    return this.chain(async (t) => {
      await t.expect(this.collapse.clientHeight).gt(0);
    });
  }

  expectCollapsed() {
    return this.chain(async (t) => {
      await t.expect(this.collapse.clientHeight).eql(0);
    });
  }
}

export { FavoriteSection };
