import { Selector } from 'testcafe';
import { BaseComponent } from '../..';
class ConversationItemUMI extends BaseComponent {
  get conversationItem() {
    return Selector('.conversation-list-item');
  }

  get conversationItemUMI(): Selector {
    return this.conversationItem.find('.umi');
  }

  getConversationItemById(id: number) {
    return this.conversationItem.filter(`[data-group-id="${id}"]`);
  }

  getConversationSectionHeaderByText(text: string) {
    return Selector('.conversation-list-section-header > p')
      .withText(text)
      .parent(0);
  }

  getUnreadCount(groupId: number, ctxKey: string) {
    return this.chain(async (t: TestController) => {
      const countStr = await this.getConversationItemById(groupId).find('.umi')
        .textContent;
      if (!countStr) {
        t.ctx[ctxKey] = 0;
      }
      t.ctx[ctxKey] = +countStr;
    });
  }

  public sendPostToGroup(
    text: string,
    groupId: number,
    user: string = '702',
    count: number = 1,
  ) {
    return this.chain(async (t, h) => {
      const client702 = await h.glipApiManager.getClient(
        h.users[`user${user}`],
        h.companyNumber,
      );
      for (let i = 0; i < count; i++) {
        await client702.sendPost(`${groupId}`, { text });
      }
    });
  }

  public sendMentionToGroup(
    groupId: number,
    user: string = '702',
    count: number = 1,
  ) {
    return this.chain(async (t, h) => {
      const client702 = await h.glipApiManager.getClient(
        h.users[`user${user}`],
        h.companyNumber,
      );
      for (let i = 0; i < count; i++) {
        await client702.sendPost(`${groupId}`, {
          groupId: groupId.toString(),
          text: `Hi, ![:Person](${h.users.user701.rc_id}), take a look!`,
        });
      }
    });
  }

  checkUnread(id: number, count: number, shouldShowUMI: boolean = true) {
    return this.chain(async (t: TestController) => {
      const item = this.getConversationItemById(id);
      const textStyle = await item.find('p').style;
      await t.expect(textStyle['font-weight']).eql('700');
      const umi = item.find('.umi');
      const umiStyle = await umi.style;
      await t
        .expect(umi.textContent)
        .eql(shouldShowUMI ? count.toString() : '');
      await t.expect(umiStyle['background-color']).eql('rgb(238, 238, 238)');
    });
  }

  checkMentionUMI(id: number, count: number, shouldShowUMI: boolean = true) {
    return this.chain(async (t: TestController) => {
      const item = this.getConversationItemById(id);
      const textStyle = await item.find('p').style;
      await t.expect(textStyle['font-weight']).eql('700');
      const umi = item.find('.umi');
      const umiStyle = await umi.style;
      await t
        .expect(umi.textContent)
        .eql(shouldShowUMI ? count.toString() : '');
      await t.expect(umiStyle['background-color']).eql('rgb(255, 136, 0)');
    });
  }

  checkMentionUMIWithAnyCount(id: number, shouldShowUMI: boolean = true) {
    return this.chain(async (t: TestController) => {
      const item = this.getConversationItemById(id);
      const textStyle = await item.find('p').style;
      await t.expect(textStyle['font-weight']).eql('700');
      const umi = item.find('.umi');
      const umiStyle = await umi.style;
      await t.expect(umi.textContent)[shouldShowUMI ? 'notEql' : 'eql']('');
      await t.expect(umiStyle['background-color']).eql('rgb(255, 136, 0)');
    });
  }

  checkNoUMI(id: number) {
    return this.chain(async (t: TestController) => {
      const item = this.getConversationItemById(id);
      const textStyle = await item.find('p').style;
      await t.expect(textStyle['font-weight']).eql('400');
      const umi = item.find('.umi');
      const umiStyle = await umi.style;
      await t.expect(umi.textContent).eql('');
      await t.expect(umiStyle['background-color']).eql('rgb(238, 238, 238)');
    });
  }

  checkNoUMIInHeader(text: string) {
    return this.chain(async (t: TestController) => {
      const header = this.getConversationSectionHeaderByText(text);
      const umi = header.child('.umi');
      const count = await umi.count;
      if (count === 1) {
        await t.expect(umi.textContent).eql('');
      } else {
        await t.expect(umi.count).eql(0);
      }
    });
  }

  checkUnreadInHeader(
    text: string,
    count: number,
    withMention: boolean = false,
  ) {
    return this.chain(async (t: TestController) => {
      const header = this.getConversationSectionHeaderByText(text);
      const umi = header.child('.umi');
      await t.expect(umi.exists).ok();
      const umiStyle = await umi.style;
      await t.expect(umi.textContent).eql(count.toString());
      await t
        .expect(umiStyle['background-color'])
        .eql(withMention ? 'rgb(255, 136, 0)' : 'rgb(238, 238, 238)');
    });
  }

  clickGroupHeader(text: string) {
    return this.chain(async (t: TestController) => {
      const header = this.getConversationSectionHeaderByText(text);
      await t.click(header);
    });
  }

  favoriteGroup(groupId: number) {
    return this.chain(async (t: TestController) => {
      const item = this.getConversationItemById(groupId);
      const moreIcon = item.find('span').withText('more_vert');
      await t.click(moreIcon);
      const favoriteButton = Selector('#render-props-menu')
        .find('li')
        .withText('Favorite');
      await t.click(favoriteButton);
    });
  }

  unFavoriteGroup(groupId: number) {
    return this.chain(async (t: TestController) => {
      const item = this.getConversationItemById(groupId);
      const moreIcon = item.find('span').withText('more_vert');
      await t.click(moreIcon);
      const favoriteButton = Selector('#render-props-menu')
        .find('li')
        .withText('UnFavorite');
      await t.click(favoriteButton);
    });
  }
}

export { ConversationItemUMI };
