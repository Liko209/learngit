/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-08-21 16:35:03
 * Copyright © RingCentral. All rights reserved.
 */
import { ReactSelector } from 'testcafe-react-selectors';
import { GroupAPI } from '../../../libs/sdk';
import { BaseComponent } from '../..';

class TeamSection extends BaseComponent {
  get teamSection() {
    return ReactSelector('ConversationListSection').withProps('title', 'Teams');
  }

  get team0() {
    return this.teamSection.findReact('ConversationListItem').nth(0);
  }
  get teams() {
    return this.teamSection.findReact('ConversationListItem');
  }
  public shouldBeTeam() {
    return this.chain(async t => {
      await t
        .expect(this.team0.exists)
        .ok('Fail to find the team, probably caused by long-time loading');
      const id = (await this.team0.getReact()).key;
      const props = await this._getTeamProps(id);
      return await t.expect(props.is_team).ok(`Team ${id} is not a team`);
    });
  }

  public teamNameShouldBe(name) {
    return this.chain(async t => {
      const text = () => this.team0.findReact('Typography').innerText;
      return await t.expect(text()).eql(name, 'wrong name');
    });
  }

  public createTeam() {
    return this.chain(async (t, h) => {
      const client701 = await h.glipApiManager.getClient(
        h.users.user701,
        h.companyNumber,
      );
      await client701.createGroup({
        type: 'Team',
        isPublic: true,
        name: `My Team ${Math.random().toString(10)}`,
        description: 'Best team ever',
        members: [h.users.user701.rc_id.toString()],
      });
    });
  }

  private async _getTeamProps(id: number): Promise<{ is_team: boolean }> {
    return (await GroupAPI.requestGroupById(id)).data;
  }

  modifyTeamName(name) {
    return this.chain(async t => {
      await t
        .expect(this.team0.exists)
        .ok('Fail to find the team, probably caused by long-time loading');
      const id = (await this.team0.getReact()).key;
      return await GroupAPI.modifyGroupById(id, { set_abbreviation: name });
    });
  }
  checkTeamIndex(id: number, i: number) {
    return this.chain(async t => {
      await this.teams();
      const component = await this.teams.nth(i).getReact();
      await t.expect(component.key).eql(id);
    });
  }
}

export { TeamSection };
