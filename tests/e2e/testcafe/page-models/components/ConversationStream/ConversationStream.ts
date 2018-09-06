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

  public  sendPost2Group(text:string) {
    return this.chain(async (t, h) => {
      const client701 = await h.glipApiManager.getClient(h.users.user701, h.companyNumber);
      await client701.sendPost(h.teams.team1_u1_u2.glip_id, { text });
    });
  }

  public expectRightOrder(...sequence) {
    return this.chain(async (t) => {
      const length = sequence.length;
      for (const i in sequence) {
        await t.expect(this.conversationCard.nth(length - Number(i)).textContent).contains(sequence[i]);
      }
    });
  }

  public expectLastConversationToBe(text:string) {
    return this.chain(async (t) => {
      await t.expect(this.conversationCard.nth(-1).textContent).contains(text);
    });
  }

  public expectNoPosts() {
    return this.chain(async (t) => {
      await t.expect(this.conversationCard.count).eql(0);
    });
  }
}

export { ConversationStream };
