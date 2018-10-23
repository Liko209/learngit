import { PersonAPI } from '../../../libs/sdk';
import { BaseComponent } from '../..';
import { ClientFunction, Selector } from 'testcafe';

class ConversationStream extends BaseComponent {
  targetPost: Selector;

  get teamSection() {
    return Selector('.conversation-list-section[data-name="Teams"]');
  }

  public expectExist() {
    return this.chain(async (t: TestController) => {
      await t
        .expect(this.teamSection.count)
        .eql(1, 'expect dom node exists', { timeout: 500000 });
    });
  }

  get team() {
    return this.teamSection.find('.conversation-list-item').nth(0);
  }
  get conversationCard() {
    return Selector("[data-name='conversation-card']");
  }

  get groupId() {
    return this.team.getAttribute('date-group-id');
  }
  public clickFirstGroup() {
    return this.clickElement(this.team);
  }

  public sendPost2Group(groupId: number, text: string) {
    return this.chain(async (t, h) => {
      const client701 = await h.glipApiManager.getClient(
        h.users.user701,
        h.companyNumber,
      );
      await client701.sendPost(groupId, { text });
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
      const length = await this.conversationCard.count;
      for (const i in sequence) {
        await t
          .expect(
            this._getRightOrderTextContent(length, sequence.length, Number(i)),
          )
          .contains(sequence[i]);
      }
    });
  }

  private _getRightOrderTextContent(length, sequenceLength, i) {
    return this.conversationCard
      .nth(length - sequenceLength + i)
      .child('div')
      .nth(1).textContent;
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
      this.targetPost = Selector(
        `[data-name='conversation-card'][data-id='${t.ctx[ctxPost].id}']`,
      );
      await t.expect(this.targetPost.exists).ok();
    });
  }

  checkNameOnPost(name: string) {
    return this.chain(async (t, h) => {
      const targetPost = this.targetPost.child().withText(name);
      await t.expect(targetPost.exists).ok();
    });
  }

  checkTimeFormatOnPost(ctxPost: string, format: string) {
    return this.chain(async (t, h) => {
      const formatTime = require('moment')(t.ctx[ctxPost].creationTime).format(
        format,
      );

      const timeDiv = this.targetPost.child().withText(formatTime);
      await t.expect(timeDiv.exists).ok();
    });
  }

  async getPersonProps(id: number) {
    return (await PersonAPI.requestPersonById(id)).data;
  }
}

export { ConversationStream };
