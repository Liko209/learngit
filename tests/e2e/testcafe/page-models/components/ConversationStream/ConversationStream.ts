import { ReactSelector } from 'testcafe-react-selectors';
import { PersonAPI } from '../../../libs/sdk';
import { BaseComponent } from '../..';
import { ClientFunction } from 'testcafe';

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
  get juiConversationCardHeader(){
    return ReactSelector('JuiConversationCardHeader');
  }
  public clickFirstGroup() {
    return this.clickElement(this.team);
  }

  public sendPost2Group(text: string) {
    return this.chain(async (t, h) => {
      const client701 = await h.glipApiManager.getClient(
        h.users.user701,
        h.companyNumber,
      );
      await client701.sendPost(h.teams.team1_u1_u2.glip_id, { text });
    });
  }

  public sendPost2CurrentGroup(text: string, ctxProp: string = 'postId') {
    return this.chain(async (t, h) => {
      const client = await h.glipApiManager.getClient(
        h.users.user701,
        h.companyNumber,
      );
      const getCurrentGroupIdFromURL = ClientFunction(() => {
        return Number(/messages\/(\d+)/.exec(window.location.href)[1]);
      });
      const currentGroupId = await getCurrentGroupIdFromURL();
      const resp = await client.sendPost(currentGroupId, { text });
      t.ctx[ctxProp] = resp.data;
    });
  }

  public expectRightOrder(...sequence) {
    return this.chain(async (t: TestController) => {
      const length = await this.juiConversationCardHeader.count
      for (const i in sequence) {
        await t
          .expect(this._getRightOrderTextContent(length,sequence.length,Number(i)))
          .contains(sequence[i]);
      };
    });
  }

  private _getRightOrderTextContent(length,sequenceLength,i){
    return  this.juiConversationCardHeader.nth(length - sequenceLength + i).nextSibling('div').textContent;
  }

  public expectLastConversationToBe(text: string) {
    return this.chain(async (t: TestController) => {
      await t.expect(this.conversationCard.nth(-1).textContent).contains(text);
    });
  }

  public expectNoPosts() {
    return this.chain(async (t: TestController) => {
      await t.expect(this.conversationCard.count).eql(0);
    });
  }

  shouldMatchURL() {
    return this.chain(async (t: TestController) => {
      const getLocation = ClientFunction(() => window.location.href);
      const reg = /messages\/(\d+)/;
      const location = await getLocation();
      await t.expect(location).match(reg);
    });
  }

  shouldFindPostById(ctxPost: string) {
    return this.chain(async (t: TestController) => {
      this.targetPost = ReactSelector('ConversationCard').withProps(
        'id',
        Number(t.ctx[ctxPost].id),
      );
      await t.expect(this.targetPost.exists).ok();
    });
  }

  checkNameOnPost(name: string) {
    return this.chain(async (t, h) => {
      const targetPost = this.targetPost
        .findReact('JuiConversationCardHeader')
        .withProps({
          'name': name,
        });
      await t.expect(targetPost.exists).ok();
    });
  }

  checkTimeFormatOnPost(ctxPost: string, format: string) {
    return this.chain(async (t, h) => {
      const formatTime = require('moment')(t.ctx[ctxPost].creationTime).format(
        format,
      );

      const targetPost = this.targetPost
        .findReact('JuiConversationCardHeader')
        .withProps({
          time: formatTime,
        });
      await t.expect(targetPost.exists).ok();
    });
  }

  async getPersonProps(id: number) {
    return (await PersonAPI.requestPersonById(id)).data;
  }
}

export { ConversationStream };
