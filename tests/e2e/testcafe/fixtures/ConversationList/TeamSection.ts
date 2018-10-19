/*
 * @Author: Henry Xu(henry.xu@ringcentral.com)
 * @Date: 2018-08-08 13:15:48
 * Copyright © RingCentral. All rights reserved.
 */
import { formalName } from '../../libs/filter';
import { setUp, tearDown, TestHelper } from '../../libs/helpers';
import { directLogin } from '../../utils';
import { TeamSection } from '../../page-models/components';
import { setupSDK } from '../../utils/setupSDK';

declare var test: TestFn;
fixture('TeamSection')
  .beforeEach(setUp('GlipBetaUser(1210,4488)'))
  .afterEach(tearDown());

test(
  formalName(
    'Team section display the conversation which the login user as one of the team member',
    ['P2', 'JPT-12', 'Team section'],
  ),
  async (t: TestController) => {
    await setupSDK(t);
    await directLogin(t)
      .chain(t => t.wait(10000))
      .log('1. should navigate to Team Section')
      .shouldNavigateTo(TeamSection)
      .expectExist()
      .log('2. First group should be a team')
      .shouldBeTeam();
  },
);

test(
  formalName('Each conversation should be represented by the team name.', [
    'P0',
    ' JPT-13',
    'Team section',
  ]),
  async (t: TestController) => {
    const randomTeamName = `New Name ${Date.now().toString()}`;
    await setupSDK(t);
    await directLogin(t)
      .chain(t => t.wait(10000))
      .log('1. should navigate to Team Section')
      .shouldNavigateTo(TeamSection)
      .expectExist()
      .log('2. Modify team name')
      .modifyTeamName(randomTeamName)
      .chain(t => t.wait(10000))
      .teamNameShouldBe(randomTeamName);
  },
);

test(
  formalName('Conversation that received post should been moved to top', [
    'JPT-47',
    'P2',
    'ConversationList',
  ]),
  async (t: TestController) => {
    const helper = TestHelper.from(t);
    const client701 = await helper.glipApiManager.getClient(
      helper.users.user701,
      helper.companyNumber,
    );
    const group12 = helper.teams.team1_u1_u2.glip_id;
    const group123 = helper.teams.team3_u1_u2_u3.glip_id;
    const text = 'bring me to top';

    await directLogin(t)
      .log('1. Navigate to Team section')
      .shouldNavigateTo(TeamSection)
      .expectExist()
      .log(`2. Conversation "${group12}" receive message.`)
      .chain(async t => await client701.sendPost(group12, { text }))
      .chain(t => t.wait(10000))
      .log(
        `2. Check conversation ${group12} was moved to the top of the section it's in.`,
      )
      .checkTeamIndex(group12, 0)
      .log(`3. Conversation "${group123}" receive message.`)
      .chain(async t => await client701.sendPost(group123, { text }))
      .log(
        `4.1 Check conversation ${group123} was moved to the top of the section it's in.`,
      )
      .chain(t => t.wait(3000))
      .checkTeamIndex(group123, 0)
      .log(
        `4.2 Check conversation ${group12} was moved to the second position of the section it's in.`,
      )
      .checkTeamIndex(group12, 1);
  },
);
