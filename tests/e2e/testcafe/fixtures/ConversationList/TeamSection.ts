/*
 * @Author: Henry Xu(henry.xu@ringcentral.com)
 * @Date: 2018-08-08 13:15:48
 * Copyright © RingCentral. All rights reserved.
 */
import { formalName } from '../../libs/filter';
import { setUp, tearDown } from '../../libs/helpers';
import { unifiedLogin } from '../../utils';
import { setupSDK } from '../../utils/setupSDK';
import { TeamSection } from '../../page-models/components';

declare var test: TestFn;
fixture('teamSection')
  .beforeEach(setUp('rcBetaUserAccount'))
  .afterEach(tearDown());

const randomTeamName = 'Team' + Number(new Date());

test(formalName('Team section display the conversation which the login user as one of the team member', ['P2', 'Team section']), async (t) => {
  await setupSDK(t);
  await unifiedLogin(t)
    .chain(t => t.wait(10000))
    .log('1. should navigate to Team Section')
    .shouldNavigateTo(TeamSection)
    .log('2. First group should be a team')
    .shouldBeTeam();
});

test(formalName('Modify team name', ['P0', 'Team section']), async (t) => {
  const randomTeamName = Math.random().toString(10);
  await setupSDK(t);
  await unifiedLogin(t)
    .chain(t => t.wait(10000))
    .log('1. should navigate to Team Section')
    .shouldNavigateTo(TeamSection)
    .log('2. Modify team name')
    .modifyTeamName(randomTeamName)
    .chain(t => t.wait(10000))
    .teamNameShouldBe(randomTeamName);
});
