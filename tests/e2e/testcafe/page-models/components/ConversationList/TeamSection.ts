/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-08-21 16:35:03
 * Copyright © RingCentral. All rights reserved.
 */
import { ReactSelector } from 'testcafe-react-selectors';
import { GroupAPI } from '../../../libs/sdk';
import { BasePage } from '../../BasePage';

const teamSection = ReactSelector('ConversationListSection').withProps('title', 'Teams');
const team = teamSection.findReact('ConversationListItem').nth(0);
class TeamSection extends BasePage {
  public shouldBeTeam() {
    return this.chain(async (t) => {
      await t.expect(team.exists).ok('Failed to find the team, probably caused by long-time loadng', { timeout: 1500000 });
      const id = (await team.getReact()).key;
      const props = (await this._getTeamProps(id));
      return await t.expect(props.is_team).ok(`Team ${id} is not a team`);
    });
  }

  public teamNameShouldChange() {
    return this.chain(async (t) => {
      await t.expect(team.exists).ok('Failed to find the team, probably caused by long-time loadng', { timeout: 150000 });
      const id = (await team.getReact()).key;
      const randomName = Math.random().toString(36).substring(7);
      await this._modifyTeamName(id, randomName);
      const text = () => team.findReact('Typography').innerText;
      await t.expect(text()).eql(randomName, 'wrong name', { timeout: 150000 });
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
