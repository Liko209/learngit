// author = 'mia.cai@ringcentral.com'
import { ReactSelector } from 'testcafe-react-selectors';
import { BasePage } from '../../index';

export class MaxConversation extends BasePage{
  private _getSectionListItem (section:string) {
    return ReactSelector('ConversationListSection').withProps('title', section)
      .findReact('ConversationListItem');
  }
  async checkMaxConversation(section:string, types:string, MaxNumber:number) {
    return this.chain(async (t, h) => {
      await t.wait(10000);
      const client701 = await h.glipApiManager.getClient(h.users.user701, h.companyNumber);
      const team_name = [];

      for (let i = 0; i < MaxNumber; i++) {
        const names = Date.now() + 'JPT57teams';
        const c = await client701.createGroup({ name: names, description: 'test ',
          type: types, members:[h.users.user701.rc_id] });
        team_name.push(c.data.name);
      }
      await h.log(`2.1 Create ${MaxNumber} teams`);

      let i = MaxNumber - 1;
      for (let j = 0; j < MaxNumber; j++) {
        await t
          .expect(this._getSectionListItem(section).nth(j).withProps('title', team_name[i]).exists)
            .ok('team name:' + team_name[i]);
        i = i - 1 ;
      }
      await h.log('2.2 Display recent conversations');

      await t.expect(this._getSectionListItem(section).count)
        .eql(MaxNumber, 'the count:' + this._getSectionListItem(section).count);
      await h.log(`2.3 Conversation max count is ${MaxNumber}`);
    });
  }

}
