import { ReactSelector } from 'testcafe-react-selectors';
import { PostAPI } from '../../../libs/sdk';
import { BaseComponent } from '../..';

class ConversationStream extends BaseComponent {

  get teamSection() {
    return ReactSelector('ConversationListSection').withProps('title', 'Teams');
  }

  get team() {
    return this.teamSection.findReact('ConversationListItem').nth(0);
  }
  get conversationCard() {
    return ReactSelector('ConversationCard');
  }

  get groupId() {
    return this.team.getReact().key;
  }

  public clickFirstGroup() {
    return this.clickElement(this.team);
  }

  public  sendPost2FirstGroup(text) {
    return this.chain(async t => await this._sendPost(this.groupId, text));
  }

  private async _sendPost(groupId:number, text:string) {
    await PostAPI.sendPost(groupId, text);
  }

  public expectRightOrder(...sequence) {
    return this.chain(async (t) => {
      const length = sequence.length;
      for (const i in sequence) {
        await t.expect(this.conversationCard.nth(length - Number(i)).textContent).eql(sequence[i]);
      }
    });
  }

  public expectLastConversationToBe(text:string) {
    return this.chain(async (t) => {
      await t.expect(this.conversationCard.nth(-1).textContent).eql(text);
    });
  }

  public expectNoPosts() {
    return this.chain(async (t) => {
      await t.expect(this.conversationCard.exists).notOk();
    });
  }

}

export { ConversationStream };
