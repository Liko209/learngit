import { BaseComponent } from '../../../page-models/index';
import { Selector, ClientFunction } from 'testcafe';

let conversationId = undefined;

class HighlighConversation extends BaseComponent {
  get ConversationItem(): Selector {
    return Selector('li.conversation-list-item');
  }

  get ConversationContent(): Selector {
    return Selector('.conversation-page');
  }

  expectElementExists() {
    return this.chain(async (t: TestController) => {
      await t
        .expect(this.ConversationItem.count)
        .gt(0, 'should at least one have conversation list item', {
          timeout: 50000,
        });
    });
  }

  getLastConversation() {
    return this.chain(async (t: TestController) => {
      const getLocation = ClientFunction(() => window.location.href);
      const url = await getLocation();
      const str = url.toString().split('messages/');
      conversationId = str[1];
    });
  }

  sendPostToConversation(text: string) {
    return this.chain(async (t, h) => {
      const client701 = await h.glipApiManager.getClient(
        h.users.user701,
        h.companyNumber,
      );
      await client701.sendPost(+conversationId, { text });
    });
  }

  checkHighlighConversation() {
    return this.chain(async (t: TestController) => {
      const LastConversationListItem = this.ConversationItem.filter(
        `[data-group-id="${conversationId}"]`,
      );
      const pElem = LastConversationListItem.find('p');
      const pElemStyle = await pElem.style;
      await t.expect(pElemStyle['color']).eql('rgb(6, 132, 189)');
    });
  }

  checkOpenedConversation() {
    return this.chain(async (t: TestController) => {
      await t.expect(
        Selector(`.conversation-page[data-group-id="${conversationId}"]`),
      );
    });
  }
}

export { HighlighConversation };
