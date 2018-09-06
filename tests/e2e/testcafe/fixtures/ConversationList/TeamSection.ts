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

test(formalName('Display team', ['P0', 'ConversationList']), async (t) => {
  await unifiedLogin(t)
    .shouldNavigateTo(TeamSection)
    .shouldBeTeam();
});

test(formalName('Modify team name', ['P0', 'ConversationList']), async (t) => {
  await unifiedLogin(t)
    .shouldNavigateTo(TeamSection)
    .teamNameShouldChange();
});

test(
  formalName(
    'Conversation that received post should been moved to top',
    ['JPT-47', 'P2', 'ConversationList']),
  async (t) => {
    const helper = TestHelper.from(t);
    const client702 = await helper.glipApiManager.getClient(helper.users.user702, helper.companyNumber);
    const group12 = helper.teams.team1_u1_u2.glip_id;
    const group123 = helper.teams.team3_u1_u2_u3.glip_id;
    const text = 'bring me to top';

    await unifiedLogin(t)
      .log('1. Navigate to Team section')
      .shouldNavigateTo(TeamSection)
      .log(`2. Conversation "${group12}" receive message.`)
      .chain(async t => await client702.sendPost(group12, { text }))
      .log(`2. Check conversation ${group12} was moved to the top of the section it's in.`)
      .checkTeamIndex(group12, 0)
      .log(`3. Conversation "${group123}" receive message.`)
      .chain(async t => await client702.sendPost(group123, { text }))
      .log(`4.1 Check conversation ${group123} was moved to the top of the section it's in.`)
      .checkTeamIndex(group123, 0)
      .log(`4.2 Check conversation ${group12} was moved to the second position of the section it's in.`)
      .checkTeamIndex(group12, 1);
  });
