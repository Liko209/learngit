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
    return Selector('.conversation-list-section-header p')
      .withText(text)
      .parent();
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

  // clickHeader() {
  //   return this.clickElement(this.headers);
  // }

  // public shouldExpand() {
  //   return this.chain(async (t: TestController) => {
  //     await t.expect(this.collapse.clientHeight).gt(0, 'should ');
  //   });
  // }

  // public shouldCollapsed() {
  //   return this.chain(async (t: TestController) => {
  //     await t.expect(this.collapse.clientHeight).eql(0);
  //   });
  // }

  // private async _getGroupProps(id: number) {
  //   return (await GroupAPI.requestGroupById(id)).data;
  // }

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

  public sendMentionToGroup(groupId: number, user: string = '702') {
    return this.chain(async (t, h) => {
      const client702 = await h.glipApiManager.getClient(
        h.users[`user${user}`],
        h.companyNumber,
      );
      await client702.sendPost(`${groupId}`, {
        groupId: groupId.toString(),
        text: `Hi, ![:Person](${h.users.user701.rc_id}), take a look!`,
      });
    });
  }

  // checkDMUMI(): this {
  //   return this.chain(async (t, h) => {
  //     console.log('id', h.data.privateChat.data.id);
  //     await t
  //       .click(
  //         this.conversationItem.withProps(
  //           'id',
  //           parseInt(h.data.privateChat.data.id, 10),
  //         ),
  //       )
  //       .expect(this.conversationItem.withProps('umiHint', 'true').exists)
  //       .ok();
  //     await t
  //       .expect(this.conversationItemUMI.withProps('important', 'false').exists)
  //       .ok();
  //     await t.expect(this.conversationItemUMI.attributes).eql('UnreadCount');
  //   });
  // }
  checkUnread(id: number, count: number, shouldShowUMI: boolean = true) {
    return this.chain(async (t: TestController) => {
      const item = this.getConversationItemById(id);
      const textStyle = await item.find('p').style;
      const text = await item.find('p').textContent;
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
      await t.expect(umi.exists).notOk();
    });
  }

  checkUnreadInHeader(text: string, count: number) {
    return this.chain(async (t: TestController) => {
      const header = this.getConversationSectionHeaderByText(text);
      const umi = header.child('.umi');
      await t.expect(umi.exists).ok();
      const umiStyle = await umi.style;
      await t.expect(umi.textContent).eql(count.toString());
      await t.expect(umiStyle['background-color']).eql('rgb(238, 238, 238)');
    });
  }

  clickGroupHeader(text: string) {
    return this.chain(async (t: TestController) => {
      const header = this.getConversationSectionHeaderByText(text);
      await t.click(header);
    });
  }

  // checkSectionNoUMI() {
  //   return this.chain(async (t, h) => {
  //     await t.expect(this.sections.style).eql('font-weight: normal');
  //   });
  // }

  // checkSectionUMI() {
  //   return this.chain(async (t, h) => {
  //     await t.expect(this.sections.style).eql('font-weight: normal');
  //   });
  // }

  calculateDMUMI() {
    return this.chain(async (t, h) => {});
  }
}

export { ConversationItemUMI };
