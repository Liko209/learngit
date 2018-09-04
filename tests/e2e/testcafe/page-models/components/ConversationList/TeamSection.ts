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

  get team() {
    return this.teamSection.findReact('ConversationListItem').nth(0);
  }

  public shouldBeTeam() {
    return this.chain(async (t) => {
      await t.expect(this.team.exists).ok('Fail to find the team, probably caused by long-time loading');
      const id = (await this.team.getReact()).key;
      const props = (await this._getTeamProps(id));
      return await t.expect(props.is_team).ok(`Team ${id} is not a team`);
    });
  }

  public teamNameShouldChange() {
    return this.chain(async (t) => {
      await t.expect(this.team.exists).ok('Fail to find the team, probably caused by long-time loading');
      const id = (await this.team.getReact()).key;
      const randomName = Math.random().toString(36).substring(7);
      await this._modifyTeamName(id, randomName);
      const text = () => this.team.findReact('Typography').innerText;
      await t.expect(text()).eql(randomName, 'wrong name');
    });
  }

  private async  _getTeamProps(id: number): Promise<{ is_team: boolean }> {
    return (await GroupAPI.requestGroupById(id)).data;
  }

  private async _modifyTeamName(id: number, name: string) {
    GroupAPI.modifyGroupById(id, { set_abbreviation: name });
  }
}

export { TeamSection };
