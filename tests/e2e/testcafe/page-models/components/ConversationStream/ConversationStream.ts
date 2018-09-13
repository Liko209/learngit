import { ReactSelector } from 'testcafe-react-selectors';
import { PostAPI, PersonAPI } from '../../../libs/sdk';
import { BaseComponent } from '../..';
import { ClientFunction } from 'testcafe';
import { IAccount } from '../../../libs/glip';

class ConversationStream extends BaseComponent {

  targetPost: Selector;

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

  public sendPost2Group(text: string) {
    return this.chain(async (t, h) => {
      const client701 = await h.glipApiManager.getClient(h.users.user701, h.companyNumber);
      await client701.sendPost(h.teams.team1_u1_u2.glip_id, { text });
    });
  }

  public sendPost2CurrentGroup(text: string, ctxProp: string = 'postId') {
    return this.chain(async (t, h) => {
      const client = await h.glipApiManager.getClient(h.users.user701, h.companyNumber);
      const getCurrentGroupIdFromURL = ClientFunction(() => {
        return Number(/messages\/(\d+)/.exec(window.location.href)[1]);
      });
      const currentGroupId = await getCurrentGroupIdFromURL();
      const resp = await client.sendPost(currentGroupId, { text });
      t.ctx[ctxProp] = resp.data;
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

  public expectLastConversationToBe(text: string) {
    return this.chain(async (t) => {
      await t.expect(this.conversationCard.nth(-1).textContent).contains(text);
    });
  }

  public expectNoPosts() {
    return this.chain(async (t) => {
      await t.expect(this.conversationCard.count).eql(0);
    });
  }

  shouldMatchURL() {
    return this.chain(async (t) => {
      const getLocation = ClientFunction(() => window.location.href);
      const reg = /messages\/(\d+)/;
      const location = await getLocation();
      await t.expect(location).match(reg);
    });
  }

  shouldFindPostById(ctxPost: string) {
    return this.chain(async (t) => {
      this.targetPost = ReactSelector('ConversationCard').withProps('id', Number(t.ctx[ctxPost].id));
      await t.expect(this.targetPost.exists).ok();
    });
  }

  checkMetadataInTargetPost(ctxPost: string) {
    return this.chain(async (t, h) => {
      const glipPerson = await this.getPersonProps(+h.users.user701.glip_id);
      const { first_name, last_name, email, away_status } = glipPerson;
      const displayName =
        first_name && last_name ? `${first_name} ${last_name}` :
          first_name ? first_name :
            last_name ? last_name : email;
      const title = displayName + (away_status ? ` ${away_status}` : '');
      const formatTime = require('moment')(t.ctx[ctxPost].creationTime).format('hh:mm A');
      h.log(`should find card with name ${title} and time ${formatTime}`);

      const targetPost = this.targetPost.findReact('JuiConversationCardHeader').withProps({
        name: title,
        time: formatTime,
      });
      await t.expect(targetPost.exists).ok();
      h.log('card successfully found');
    });
  }

  async getPersonProps(id: number) {
    return (await PersonAPI.requestPersonById(id)).data;
  }
}

export { ConversationStream };
