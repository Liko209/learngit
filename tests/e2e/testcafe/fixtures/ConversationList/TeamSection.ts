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

test(
  formalName(
    'Display team',
    ['P0', 'ConversationList']),
  async (t) => {
    await setupSDK(t);
    await unifiedLogin(t)
      .shouldNavigateTo(TeamSection)
      .shouldBeTeam();
  },
);

test(
  formalName(
    'Modify team name',
    ['P0', 'Team section']),
  async (t) => {
    await setupSDK(t);
    await unifiedLogin(t)
      .shouldNavigateTo(TeamSection)
      .teamNameShouldChange();
  },
);
