/*
 * @Author: Henry Xu(henry.xu@ringcentral.com)
 * @Date: 2018-08-08 13:15:48
 * Copyright © RingCentral. All rights reserved.
 */
import { formalName } from '../../libs/filter';
import { setUp, tearDown, TestHelper } from '../../libs/helpers';
import { unifiedLogin } from '../../utils';
import { TeamSection } from '../../page-models/components';

declare var test: TestFn;
fixture('TeamSection')
  .beforeEach(setUp('rcBetaUserAccount'))
  .afterEach(tearDown());

test(formalName('Display team', ['P0', 'TeamSection']), async (t) => {
  await unifiedLogin(t)
    .shouldNavigateTo(TeamSection)
    .shouldBeTeam();
});

test.only(formalName('Modify team name', ['P0', 'TeamSection']), async (t) => {
  await unifiedLogin(t)
    .shouldNavigateTo(TeamSection)
    .teamNameShouldChange();
});

test(
  formalName(
    'Conversation that received post should been moved to top',
    ['P0', 'TeamSection']),
  async (t) => {
    const helper = TestHelper.from(t);
    const client702 = await helper.glipApiManager.getClient(helper.users.user702, helper.companyNumber);
    const client703 = await helper.glipApiManager.getClient(helper.users.user703, helper.companyNumber);
    const group12 = helper.teams.team1_u1_u2.glip_id;
    const group123 = helper.teams.team3_u1_u2_u3.glip_id;

    await unifiedLogin(t)
      .shouldNavigateTo(TeamSection)
      .chain(async (t) => {
        await client702.sendPost(group12, { text: 'bring me to top' });
      })
      .checkTeamIndex(group12, 0)
      .chain(async (t) => {
        await client703.sendPost(group123, { text: 'bring me to top, and move group12 to second position' });
      })
      .checkTeamIndex(group123, 0)
      .checkTeamIndex(group12, 1);
  });
